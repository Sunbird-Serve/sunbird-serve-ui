import json

original_taskdef = ".github/workflows/task-definition.json"
secrets_array = ".github/workflows/secrets.json"


with open(original_taskdef, 'r') as file:
    task_definition = json.load(file)

    for item in task_definition:
        if "containerDefinitions" in item:
            containerDefinitions = task_definition['containerDefinitions']
            for item in containerDefinitions:
                if "secrets" in item:
                    print("secret block exists")
                    # print(json.dumps(containerDefinitions[0]['secrets'], indent=4)) # if want to print


with open(secrets_array, 'r') as new_file:
    new_data = json.load(new_file)
    new_secrets = new_data['secrets']
    # print(json.dumps(new_secrets, indent=4))

# __task_definition = task_definition["taskDefinition"]
# __secrets_to_replace = __task_definition["containerDefinitions"]
# secrets_to_replace = __secrets_to_replace[0]["secrets"]
# __secrets_to_replace[0]["secrets"] = new_secrets


__secrets_to_replace = task_definition['containerDefinitions']
secrets_to_replace = __secrets_to_replace[0]['secrets']
__secrets_to_replace[0]['secrets'] = new_secrets

# task_definition['secrets'] = new_secrets		#replace old secrets block with new_secrets


print(json.dumps(task_definition, indent=4))


# writing to new file
with open(".github/workflows/task-definition.json", 'w') as outfile:
    json.dump(task_definition, outfile, indent=4)

print("Updated JSON has been written to new_task_definition.json file.")