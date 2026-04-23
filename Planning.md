# Flow Sentinal
The tool is supposed to be a pipeline leak detection and prediction software.

## Modules
The project has several capabilities which have been grouped into the following modules:

### Data Visualization:
* The home page should have a GUI to showcase the current flow.
* The home page has a stats table showing relevant stats.
### Data Analytics:
* A leak prediction page where all the relevant info for a pipe is present. 
* Ability to manually review a pipe's or node's information.
* Update information to add remove the data.
### Alerts:
* Priority & role based alert management.
### Task 
* Ability to showcase tasks for a person.
* Ability to assign tasks.


## Database:
* Staff : EmpId, Role, Location, Field
* Pipes : Node1, Node2, PlannedAmount, CurrentAmount, MaxSafe, MaterialofPipe, LiquidCarried, LastMaintained, MaintenanceLogId
* Nodes: Location, x-coor, y-coor, role, MaintenanceLogId
* MaintenanceLogs (NoSQL): should have files with MaintenanceLogId as their index, and a linkedlist which connects all MaintenanceLogIDs for a particular node for easy review.