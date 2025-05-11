import sys
import json
import re

try:
    # Read in both lists as a .json
    data = json.load(sys.stdin)
    print(f"Received data: {data}", file=sys.stderr)

    # Create lists by assigning fields contained within the .json
    rulesList = data.get('rulesList', [])
    inputList = data.get('inputList', [])

    outputList = []

    for line in inputList:
    # For each line in the input
        print(f"Original line: {line}", file=sys.stderr)
        target = line

        for rule in rulesList:
        # Go through each line in the rules

            print(f"\nNEW RULE\nBefore rule: {target}", file=sys.stderr)

            # And split it into segments by '/'
            segments = rule.split('/')

            if len(segments) != 3:
            # If there aren't exactly 3 segments, skip
                print(f"Skipping invalid rule: {rule}", file=sys.stderr)
                continue
            
            # Create the search and replacement keys from the created segments
            searchKey = segments[2].replace('_', segments[0])
            replacementKey = segments[2].replace('_', segments[1])

            print(f"Applying rule: {rule}", file=sys.stderr)
            print(f"Pattern: {searchKey} -> {replacementKey}", file=sys.stderr)

            # Replace any instances of the search key with the replacement key using RegEx
            target = re.sub(searchKey, replacementKey, target)
            print(f"Result: {target}", file=sys.stderr)

        # Append the processed line to the output list
        outputList.append(target)

    # Output the list as .json
    print(f"Final result: {outputList}", file=sys.stderr)
    print(json.dumps(outputList), flush=True)

except Exception as e:
    print(f"Error: {e}", file=sys.stderr)  # Print any errors to stderr
    sys.exit(2)  # Exit with a non-zero code to indicate failure