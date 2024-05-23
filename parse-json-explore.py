import os
import json

# get balance_space1.json from balance dir
with open('balance/balance_space1.json', 'r') as f:
  balance_space1 = json.load(f)
# get keys
keys = balance_space1.keys()
# for each key, print the key, then the keys of the value or the first value if its  alist
for k in keys:
  print(k)
  if type(balance_space1[k]) == list:
    print(balance_space1[k][0].keys())
  elif type(balance_space1[k]) == str:
    print(balance_space1[k])
  elif type(balance_space1[k]) == dict:
    print(balance_space1[k].keys())
  else:
    print(balance_space1[k])
  print('-----')

def deep_compare_objects(obj1, obj2, key_prefix='', file1_name='first', file2_name='second', diffs=None):
    if diffs is None:
        diffs = {'total_diffs': 0, 'details': []}
    
    if isinstance(obj1, dict) and isinstance(obj2, dict):
        keys = set(obj1.keys()).union(set(obj2.keys()))
        for key in keys:
            new_prefix = f"{key_prefix}.{key}" if key_prefix else key
            if key in obj1 and key not in obj2:
                diffs['details'].append(f"Key '{new_prefix}' is in {file1_name} but not in {file2_name}.")
                diffs['total_diffs'] += 1
            elif key not in obj1 and key in obj2:
                diffs['details'].append(f"Key '{new_prefix}' is in {file2_name} but not in {file1_name}.")
                diffs['total_diffs'] += 1
            else:
                deep_compare_objects(obj1[key], obj2[key], new_prefix, file1_name, file2_name, diffs)
    elif isinstance(obj1, list) and isinstance(obj2, list):
        for i in range(max(len(obj1), len(obj2))):
            if i >= len(obj1):
                diffs['details'].append(f"Index {key_prefix}[{i}] missing in {file1_name}.")
                diffs['total_diffs'] += 1
            elif i >= len(obj2):
                diffs['details'].append(f"Index {key_prefix}[{i}] missing in {file2_name}.")
                diffs['total_diffs'] += 1
            else:
                deep_compare_objects(obj1[i], obj2[i], f"{key_prefix}[{i}]", file1_name, file2_name, diffs)
    else:
        if obj1 != obj2:
            diffs['details'].append(f"Difference at '{key_prefix}': {obj1} vs {obj2}")
            diffs['total_diffs'] += 1
    
    return diffs

dict_of_diffs = {}
def load_json(file_path):
    with open(file_path, 'r') as file:
        return json.load(file)

def main(directory_path, base_file, keys_to_compare):
    base_dict = load_json(base_file)
    base_file_name = os.path.basename(base_file)
    files = os.listdir(directory_path)

    # Filter JSON files
    json_files = [file for file in files if file.endswith('.json') and file != base_file_name]

    for file in json_files:
        file_path = os.path.join(directory_path, file)
        compare_dict = load_json(file_path)
        print(f"Comparing {base_file_name} to {file}...")
        diffs = compare_specific_keys(base_dict, compare_dict, keys_to_compare, base_file_name, file)
        print("\n".join(diffs['details']))
        print(f"\nTotal differences: {diffs['total_diffs']}\n")
        print("-" * 50 + "\n")
        # save diffs to dict for later analysis
        dict_of_diffs[file] = diffs

def compare_specific_keys(dict1, dict2, keys, file1_name, file2_name):
    diffs = {'total_diffs': 0, 'details': []}
    for key in keys:
        val1 = dict1.get(key, None)
        val2 = dict2.get(key, None)
        if isinstance(val1, (dict, list)) and isinstance(val2, (dict, list)):
            deep_compare_objects(val1, val2, key, file1_name, file2_name, diffs)
        elif val1 != val2:
            diffs['details'].append(f"Difference in '{key}': {val1} vs {val2}")
            diffs['total_diffs'] += 1
    return diffs


# Keys to compare based on previous analysis of thematic elements, currency types, and miner details
keys_to_compare = [
    'ThemeId', 
    'CoreCurrencyId', 
    'SoftCurrencyId', 
    'Miners', 
    'MineShafts',
    'CrushableRewards', 
    'Rocks'
]
keys_to_compare = ['MineShafts']

# Provide the path to your directory and the base file you want to compare others with
main('balance', 'balance/balance_space1.json', keys_to_compare)
# save dict of diffs to file
with open('diffsMineshafts.json', 'w') as f:
  json.dump(dict_of_diffs, f, indent=2)