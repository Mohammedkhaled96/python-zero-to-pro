def total_size(node):
    return node["size"] + sum(total_size(child) for child in node["children"])
