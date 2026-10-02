# Leave Management System Requirements  
  
## Overview  
  
The Leave Management System (LMS) allows employees to apply for leave, managers to approve or reject requests, and administrators to configure policies, holidays, and reports.  
  
---  
  
# User Roles  
  
## Employee (User)  
  
### Features  
  
* View leave balance.  
* Apply for leave.  
* Cancel leave request.  
* View leave history.  
* View holidays.  
* Track approval or rejection status.  
  
---  
  
## Manager  
  
### Features  
  
* View team members.  
* Approve leave requests.  
* Reject leave requests.  
* Add remarks/comments.  
* View team leave calendar.  
* Escalate requests to Administrator when necessary.  
  
---  
  
## Administrator  
  
### Features  
  
* Manage employees and managers.  
* Configure leave policies.  
* Configure holidays.  
* Manage leave balances.  
* Perform final approval.  
* Generate reports.  
  
---  
  
# Leave Types  
  
## MCL (Marriage/Casual Leave)  
  
* Limited yearly quota.  
* Leave balance should be maintained.  
  
## PL (Privilege Leave)  
  
* Earned annually.  
* Can be carried forward (depending on company policy).  
  
## SL (Sick Leave)  
  
* Used during sickness.  
* Limited yearly quota.  
  
## Compensatory Leave (Comp-Off)  
  
* Granted for working on weekends or holidays.  
* Can be used later as leave.  
* May have an expiry period.  
  
---  
  
# Blood Relation Leave Module  
  
Special leave for emergencies or death of close family members.  
  
## Allowed Relations  
  
* Father  
* Mother  
* Grandfather  
* Grandmother  
* Father-in-law  
* Mother-in-law  
  
## Business Rules  
  
* Can be used only once.  
* After usage:  
  
  * Status becomes **Consumed**.  
  * Leave option automatically becomes unavailable.  
  
---  
  
# Holiday Management  
  
## Public Holidays  
  
Examples:  
  
* Republic Day  
* Independence Day  
* Diwali  
* Christmas  
  
## Company Holidays  
  
* Festival holidays  
* Regional holidays  
  
## Features  
  
* Holiday calendar.  
* Upcoming holidays listing.  
  
---  
  
# Leave Request Workflow  
  
## Step 1: Employee Raises Request  
  
### Fields  
  
* Leave type  
* Start date  
* End date  
* Reason  
* Attachment (optional)  
  
---  
  
## Step 2: Manager Reviews Request  
  
Manager can:  
  
* Approve  
* Reject  
* Request modification  
  
---  
  
## Step 3: Admin Review (Optional)  
  
Administrator can:  
  
* Approve  
* Reject  
* Override manager decision  
  
---  
  
# Leave Request States  
  
```text  
Pending  
    ↓  
Manager Approved  
    ↓  
Admin Approved (Optional)  
    ↓  
Approved  
  
OR  
  
Rejected  
```  
  
---  
  
# Sandwich Leave Policy  
  
If weekends or holidays fall between leave days, they are also counted as leave days.  
  
### Example  
  
```text  
Friday     Leave  
Saturday   Weekend  
Sunday     Weekend  
Monday     Leave  
```  
  
**Total leave deducted = 4 days**  
  
---  
  
# Leave Balance Management  
  
System should:  
  
* Track available balance.  
* Track used leaves.  
* Prevent applying beyond available balance.  
* Update balance after approval.  
  
---  
  
# Notifications  
  
Notifications should be sent when:  
  
* Leave applied.  
* Leave approved.  
* Leave rejected.  
* Leave cancelled.  
* Leave balance is low.  
  
## Channels  
  
* Email  
* SMS (optional)  
* In-app notifications  
  
---  
  
# Monthly Reports  
  
## Overall Reports  
  
* Total leave requests.  
* Approved requests.  
* Rejected requests.  
* Pending requests.  
  
## Employee-wise Reports  
  
* Total leaves taken.  
* Remaining balance.  
  
## Department-wise Reports  
  
* Total leaves per department.  
  
## Leave Type-wise Reports  
  
* PL usage.  
* SL usage.  
* MCL usage.  
* Comp-Off usage.  
  
---  
  
# Audit Logs  
  
Track:  
  
* Who applied.  
* Who approved.  
* Who rejected.  
* Date and time of actions.  
  
Used for compliance and auditing.  
  
---  
  
# Dashboard  
  
## Employee Dashboard  
  
* Leave balance.  
* Upcoming holidays.  
* Recent requests.  
* Leave history.  
  
---  
  
## Manager Dashboard  
  
* Pending approvals.  
* Team leave calendar.  
* Team availability.  
  
---  
  
## Admin Dashboard  
  
* Overall statistics.  
* Employees currently on leave.  
* Monthly reports.  
* Holiday management.  
  
---  
  
# Core Entities (Database Tables)  
  
## Users  
  
| Field | Type   |  
| ----- | ------ |  
| id    | UUID   |  
| name  | String |  
| email | String |  
| role  | Enum   |  
  
---  
  
## LeaveTypes  
  
| Field        | Type    |  
| ------------ | ------- |  
| id           | UUID    |  
| name         | String  |  
| yearly_limit | Integer |  
  
---  
  
## LeaveRequests  
  
| Field         | Type |  
| ------------- | ---- |  
| id            | UUID |  
| user_id       | UUID |  
| leave_type_id | UUID |  
| start_date    | Date |  
| end_date      | Date |  
| reason        | Text |  
| status        | Enum |  
  
---  
  
## LeaveBalances  
  
| Field             | Type    |  
| ----------------- | ------- |  
| user_id           | UUID    |  
| leave_type_id     | UUID    |  
| available_balance | Integer |  
  
---  
  
## Holidays  
  
| Field        | Type   |  
| ------------ | ------ |  
| id           | UUID   |  
| holiday_name | String |  
| holiday_date | Date   |  
  
---  
  
## BloodRelationLeaves  
  
| Field    | Type    |  
| -------- | ------- |  
| user_id  | UUID    |  
| relation | String  |  
| is_used  | Boolean |  
  
---  
  
## Approvals  
  
| Field            | Type |  
| ---------------- | ---- |  
| leave_request_id | UUID |  
| manager_id       | UUID |  
| admin_id         | UUID |  
| status           | Enum |  
| remarks          | Text |  
  
---  
  
# Non-Functional Requirements  
  
## Security  
  
* Authentication  
* Authorization  
* Role-Based Access Control (RBAC)  
  
## Scalability  
  
* Production-ready architecture.  
* Horizontal scaling support.  
  
## Reliability  
  
* Data consistency.  
* Input validation.  
* Error handling.  
  
## Monitoring  
  
* Audit logs.  
* Report generation.  
  
## User Experience  
  
* Responsive UI.  
* Mobile-friendly design.  
  
---  
  
# Future System Design Components  
  
After defining requirements, the following should be designed:  
  
1. Modules  
2. Database Schema  
3. APIs  
4. Role Permissions  
5. Workflow  
6. System Architecture  
7. Business Rules  
8. Edge Cases  
9. Notifications  
10. Reporting System  
  
