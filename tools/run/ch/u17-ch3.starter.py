def total_size(node):
    return node["size"] + sum(child["size"] for child in node["children"])
