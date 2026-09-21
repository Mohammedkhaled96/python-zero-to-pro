import sys, io, os, re, json, base64, shutil, importlib, traceback, contextlib, linecache, builtins

os.environ.setdefault("MPLBACKEND", "AGG")
sys.dont_write_bytecode = True   # الموديولات بتتعدّل كتير — من غير كاش قديم
__course_spaces = {}
OUTPUT_LIMIT = 50_000
WORK_ROOT = os.path.abspath("course_work")
__course_dirs = set()
try:
    sys.modules["__main__"].__file__ = "main.py"
except Exception:
    pass


class _CourseOutputLimit(BaseException):
    """بتوقف البرنامج لو طبع كمية ضخمة (غالبًا حلقة لا نهائية فيها print)"""


class _CourseCappedIO(io.StringIO):
    over = False

    def write(self, s):
        if self.over:
            raise _CourseOutputLimit()
        room = OUTPUT_LIMIT - self.tell()
        if len(s) > room:
            self.over = True
            super().write(s[:max(room, 0)])
            raise _CourseOutputLimit()
        return super().write(s)

    def force_write(self, s):
        return io.StringIO.write(self, s)


def __course_fresh():
    return {"__name__": "__main__", "__builtins__": builtins, "__file__": "main.py"}


def __course_dir(key):
    return os.path.join(WORK_ROOT, re.sub(r"[^\w.-]", "_", key))


def __course_enter(key, files_json):
    """كل درس في فولدر لوحده + ملفات البيانات والموديولات اللي محتاجها"""
    d = __course_dir(key)
    os.makedirs(d, exist_ok=True)
    os.chdir(d)
    for old in list(__course_dirs):
        while old in sys.path:
            sys.path.remove(old)
    __course_dirs.add(d)
    sys.path.insert(0, d)
    for f in json.loads(files_json or "[]"):
        name = f["name"].replace("\\", "/").lstrip("/")
        if ".." in name.split("/"):
            continue
        path = os.path.join(d, name)
        if f.get("seed") and os.path.exists(path):
            continue
        os.makedirs(os.path.dirname(path) or d, exist_ok=True)
        with open(path, "w", encoding="utf-8") as fh:
            fh.write(f["content"])
        if name.endswith(".py"):
            mod = name[:-3].replace("/", ".")
            if mod.endswith(".__init__"):
                mod = mod[:-9]
            for m in [m for m in sys.modules if m == mod or m.startswith(mod + ".")]:
                sys.modules.pop(m, None)
    importlib.invalidate_caches()


def __course_reset_logging():
    """كل تشغيل يبدأ بإعدادات logging نضيفة — زي البرنامج اللي بيتشغّل لوحده"""
    logging = sys.modules.get("logging")
    if logging is None:
        return
    root = logging.getLogger()
    for h in root.handlers[:]:
        root.removeHandler(h)
    root.setLevel(logging.WARNING)
    for lg in list(logging.Logger.manager.loggerDict.values()):
        if isinstance(lg, logging.Logger):
            for h in lg.handlers[:]:
                lg.removeHandler(h)
            lg.setLevel(logging.NOTSET)
            lg.propagate = True
            lg.disabled = False
    logging.disable(logging.NOTSET)


def __course_input(prompt=""):
    """input بتعرض المدخل بعد السؤال — عشان الناتج يبان زي الـ Terminal"""
    sys.stdout.write(str(prompt))
    line = sys.stdin.readline()
    if not line:
        raise EOFError("EOF when reading a line")
    line = line.rstrip("\r\n")
    sys.stdout.write(line + "\n")
    return line


def __course_source(name, code):
    linecache.cache[name] = (len(code), None, code.splitlines(True), name)


def __course_exec(code, stdin_text, ns, filename="main.py"):
    """ينفّذ كود الطالب ويرجّع (الناتج، هل وقع؟، اسم مكتبة ناقصة)"""
    buf = _CourseCappedIO()
    failed = False
    missing = None
    old_in, old_input = sys.stdin, builtins.input
    sys.stdin = io.StringIO(stdin_text)
    builtins.input = __course_input
    __course_source(filename, code)
    try:
        with contextlib.redirect_stdout(buf), contextlib.redirect_stderr(buf):
            try:
                exec(compile(code, filename, "exec"), ns)
            except SystemExit as e:
                if e.code not in (None, 0):
                    failed = True
                    print(f"\n[البرنامج خرج بكود {e.code}]")
            except _CourseOutputLimit:
                failed = True
                buf.force_write("\n\n[⚠️ البرنامج طبع كمية ضخمة جدًا فوقّفناه — غالبًا فيه حلقة بتطبع من غير نهاية]")
            except BaseException as e:
                failed = True
                if isinstance(e, ModuleNotFoundError) and e.name:
                    missing = e.name.split(".")[0]
                tb = e.__traceback__
                tb = tb.tb_next if tb is not None else None
                buf.force_write("".join(traceback.format_exception(type(e), e, tb)))
    finally:
        sys.stdin, builtins.input = old_in, old_input
    return buf.getvalue(), failed, missing


def __course_snapshot():
    found = {}
    for root, _dirs, files in os.walk("."):
        for name in files:
            if name.lower().endswith(".png"):
                path = os.path.join(root, name)
                try:
                    found[path] = os.path.getmtime(path)
                except OSError:
                    pass
    return found


def __course_run(code, stdin_text, key, files_json="[]", filename="main.py"):
    ns = __course_spaces.setdefault(key, __course_fresh())
    __course_enter(key, files_json)
    __course_reset_logging()
    before = __course_snapshot()
    ns["__file__"] = filename
    out, failed, missing = __course_exec(code, stdin_text, ns, filename)
    images = []
    for path, mtime in __course_snapshot().items():
        if before.get(path) != mtime:
            with open(path, "rb") as f:
                images.append([os.path.basename(path), base64.b64encode(f.read()).decode()])
    return json.dumps({"out": out, "failed": failed, "missing": missing, "images": images},
                      ensure_ascii=False)


def __course_reset(key):
    __course_spaces.pop(key, None)
    d = __course_dir(key)
    if os.path.isdir(d):
        if os.getcwd().startswith(d):
            os.chdir(WORK_ROOT)
        shutil.rmtree(d, ignore_errors=True)
    return "{}"


def __course_test(user_code, tests_code):
    """يشغّل اختبارات التحدّي على كود الطالب ويرجّع النتايج كـ JSON"""
    def run_program(stdin_text=""):
        out, _failed, _missing = __course_exec(user_code, stdin_text, __course_fresh())
        return out

    __course_enter("challenge", "[]")
    __course_reset_logging()
    tests_ns = __course_fresh()
    tests_ns["run_program"] = run_program
    tests_ns["USER_CODE"] = user_code
    __course_source("tests.py", tests_code)
    exec(compile(tests_code, "tests.py", "exec"), tests_ns)
    tests = [(n, f) for n, f in tests_ns.items() if n.startswith("test_") and callable(f)]

    result = {"crash": None, "output": "", "missing": None, "tests": []}
    if not tests_ns.get("PROGRAM_MODE"):
        user_ns = __course_fresh()
        out, failed, missing = __course_exec(user_code, "", user_ns)
        result["output"] = out
        if failed:
            result["crash"] = out
            result["missing"] = missing
            return json.dumps(result, ensure_ascii=False)
        for name, value in user_ns.items():
            if not name.startswith("__"):
                tests_ns[name] = value
        tests_ns["OUTPUT"] = out

    for name, fn in tests:
        label = (fn.__doc__ or name).strip()
        try:
            with contextlib.redirect_stdout(io.StringIO()):
                fn()
            result["tests"].append([label, True, ""])
        except AssertionError as e:
            result["tests"].append([label, False, str(e) or "النتيجة مش مطابقة للمطلوب"])
        except BaseException as e:
            result["tests"].append([label, False, f"{type(e).__name__}: {e}"])
    return json.dumps(result, ensure_ascii=False)
