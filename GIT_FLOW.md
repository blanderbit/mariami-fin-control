# Git Flow Instructions

## Branching Rules
- **Branch Naming Convention**: Branch names should correspond to the ticket number in the task tracker board, e.g., `TICKET-123`.
- **Main Branches**:
  - `main`: The stable production-ready branch.
  - `dev`: The integration branch for ongoing development.
- **Feature Branches**:
  - Branch off from  `dev`.
  - Name as the ticket number, e.g., `TICKET-456`.
- **Hotfix Branches**:
  - Branch off from `dev` for urgent fixes.
  - Name as `hotfix-TICKET-789`.

## Commit Rules
- Commits should be clear and descriptive.
- Format:
  ```
  Title
   - Change 1
   - Change 2
  ```
- Example:
  ```
  Messages list
   - Added messages list component
   - Fixed bugs with displaying message text on messages list
  ```

## Pull Request (PR) Rules
- **Naming**: PR names should be clear and concise.
- **Content**:
  - Should have a limited number of changes for easier review.
  - Include a detailed description with all changes and known issues.
- **Example Template**:
  **Name**: Feature request  
  **Description**: Suggest an idea.  
  **Labels**: [enhancement]  
  **Title**: `[Feature Request] `  
  **Body**:
  - **Is your feature request related to a problem?**  
    A clear and concise description of what the problem is.  
  - **Describe the solution you'd like**  
    A clear and concise description of what you want to happen.  
  - **Describe alternatives you've considered**  
    A clear and concise description of any alternative solutions or features you've considered.  
  - **Additional context**  
    Add any other context or screenshots about the feature request here.  

## Workflow Overview
1. **Create a Branch**:
   - Always branch off from the appropriate base branch `dev`.
   - Use the ticket number for naming.
2. **Make Commits**:
   - Write clear and concise commit messages following the format.
3. **Push Changes**:
   - Push the branch to the remote repository.
4. **Create a Pull Request**:
   - Ensure the PR title and description are clear.
   - Request a review from the relevant team members.
5. **Review and Merge**:
   - Address any feedback from reviewers.
   - Merge the branch after approval and successful tests.
6. **Delete Branch**:
   - Delete the branch after merging to keep the repository clean.

## Additional Notes
- Keep PRs focused and avoid bundling unrelated changes.
- Ensure all code follows the project's coding standards and passes tests.
- Regularly sync your branch with the base branch to resolve conflicts early.