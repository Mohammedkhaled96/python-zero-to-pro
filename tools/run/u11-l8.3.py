command = "move north"
match command.split():
    case ["quit"]:
        print("باي")
    case ["move", direction]:
        print(f"بتتحرّك ناحية {direction}")
    case ["pick", *items]:
        print(f"شلت: {items}")
    case _:
        print("أمر مش مفهوم")
