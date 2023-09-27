# tlda/cli

A CLI that is used to administrate the application (users, departments, etc).

This was implemented due to a time crunch on the project.

## Structure 
- commands: Implemenation of commands, categorised by the resource they operate on
- util: Helper functions used within the CLI.
- tlda: A file used to run the CLI - uses shebang to require no program (i.e., `python3 tlda ...`)

## Dependencies
- click: CLI handler
- requests: HTTP request client