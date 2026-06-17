/**
 * @openapi
 * /api/users/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *               recaptchaToken: { type: string }
 *     responses:
 *       201:
 *         description: User created
 */

/**
 * @openapi
 * /api/users/logon:
 *   post:
 *     summary: Log on with email and password
 *     tags: [Users]
 */

/**
 * @openapi
 * /api/users/googleLogon:
 *   post:
 *     summary: Log on with Google OAuth authorization code
 *     tags: [Users]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code: { type: string }
 */

/**
 * @openapi
 * /api/tasks:
 *   get:
 *     summary: List tasks for the authenticated user
 *     tags: [Tasks]
 *     parameters:
 *       - in: query
 *         name: folder
 *         schema: { type: integer }
 *       - in: query
 *         name: trash
 *         schema: { type: string, enum: [true, false, all] }
 *       - in: query
 *         name: isCompleted
 *         schema: { type: boolean }
 *   post:
 *     summary: Create a task
 *     tags: [Tasks]
 */

/**
 * @openapi
 * /api/tasks/many:
 *   patch:
 *     summary: Update many tasks matching query filters
 *     tags: [Tasks]
 *   delete:
 *     summary: Move many tasks to trash using query filters
 *     tags: [Tasks]
 */

/**
 * @openapi
 * /api/tasks/by-ids:
 *   patch:
 *     summary: Update tasks by ID array
 *     tags: [Tasks]
 *   delete:
 *     summary: Move tasks to trash by ID array
 *     tags: [Tasks]
 */

/**
 * @openapi
 * /api/tasks/trash:
 *   delete:
 *     summary: Permanently delete all trashed tasks
 *     tags: [Tasks]
 */

/**
 * @openapi
 * /api/tasks/{id}/logs:
 *   post:
 *     summary: Add a progress log entry for a task
 *     tags: [Tasks]
 */

/**
 * @openapi
 * /api/folders:
 *   get:
 *     summary: List folders for the authenticated user
 *     tags: [Folders]
 *   post:
 *     summary: Create a folder
 *     tags: [Folders]
 */

/**
 * @openapi
 * /api/backlog:
 *   get:
 *     summary: List backlog items
 *     tags: [Backlog]
 *   post:
 *     summary: Create a backlog item
 *     tags: [Backlog]
 */

/**
 * @openapi
 * /api/backlog/{id}/claim:
 *   post:
 *     summary: Claim a backlog item and create a task
 *     tags: [Backlog]
 */

/**
 * @openapi
 * /api/analytics/users:
 *   get:
 *     summary: Manager-only list of users with task stats
 *     tags: [Analytics]
 */
