/* ================= Python syntax highlighter (خفيف، بدون مكتبات خارجية) ============== */
(function(){
  const KW = ["False","None","True","and","as","assert","async","await","break","class","continue",
    "def","del","elif","else","except","finally","for","from","global","if","import","in","is",
    "lambda","nonlocal","not","or","pass","raise","return","try","while","with","yield","match","case"];
  const BI = ["print","input","int","float","str","bool","list","dict","set","tuple","len","range",
    "type","sum","min","max","sorted","reversed","enumerate","zip","abs","round","open","ord","chr",
    "map","filter","any","all","isinstance","format","eval","help","id","divmod","pow","repr","exit",
    "ValueError","TypeError","ZeroDivisionError","IndexError","KeyError","FileNotFoundError",
    "NameError","Exception","AttributeError","ImportError","StopIteration","OverflowError","self"];
  const RE = new RegExp(
    "(#[^\\n]*)" +                                            // 1 comment
    "|(\"\"\"[\\s\\S]*?\"\"\"|'''[\\s\\S]*?'''" +
      "|[fFrRbB]{0,2}\"(?:\\\\.|[^\"\\\\\\n])*\"" +
      "|[fFrRbB]{0,2}'(?:\\\\.|[^'\\\\\\n])*')" +             // 2 string
    "|\\b(\\d+\\.?\\d*)\\b" +                                 // 3 number
    "|\\b(" + KW.join("|") + ")\\b" +                          // 4 keyword
    "|\\b(" + BI.join("|") + ")\\b", "g");                     // 5 builtin
  const esc = s => s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  window.hlPython = function(src){
    let out = "", last = 0, m;
    RE.lastIndex = 0;
    while((m = RE.exec(src)) !== null){
      out += esc(src.slice(last, m.index));
      const cls = m[1] ? "tk-cm" : m[2] ? "tk-str" : m[3] ? "tk-num" : m[4] ? "tk-kw" : "tk-bi";
      out += '<span class="' + cls + '">' + esc(m[0]) + '</span>';
      last = m.index + m[0].length;
    }
    out += esc(src.slice(last));
    return out;
  };
})();