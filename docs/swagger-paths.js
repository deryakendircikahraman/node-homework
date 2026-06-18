/**
 * @openapi
 * /api/users/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string, example: "Test User" }
 *               email: { type: string, example: "test@example.com" }
 *               password: { type: string, example: "Password1!" }
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
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, example: "test@example.com" }
 *               password: { type: string, example: "Password1!" }
 *     responses:
 *       200:
 *         description: Login successful (returns csrfToken)
 */

/**
 * @openapi
 * /api/users/googleLogon:
 *   post:
 *     summary: Log on with Google OAuth authorization code
 *     tags: [Users]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code]
 *             properties:
 *               code: { type: string, example: "google-authorization-code" }
 *     responses:
 *       200:
 *         description: Existing user logged in
 *       201:
 *         description: New user created and logged in
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
 *       - in: query
 *         name: find
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *   post:
 *     summary: Create a task
 *     tags: [Tasks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title: { type: string, example: "Rapor yaz" }
 *               isCompleted: { type: boolean, example: false }
 *               priority: { type: string, enum: [low, medium, high], example: "medium" }
 *               folderId: { type: integer, example: 1, nullable: true }
 *     responses:
 *       201:
 *         description: Task created
 */

/**
 * @openapi
 * /api/tasks/many:
 *   patch:
 *     summary: Update many tasks matching query filters
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
 *       - in: query
 *         name: find
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               isCompleted: { type: boolean, example: true }
 *               priority: { type: string, enum: [low, medium, high] }
 *               folderId: { type: integer, nullable: true }
 *               trash: { type: boolean }
 *     responses:
 *       200:
 *         description: Tasks updated
 *   delete:
 *     summary: Move many tasks to trash using query filters
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
 *       - in: query
 *         name: find
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Tasks moved to trash
 */

/**
 * @openapi
 * /api/tasks/by-ids:
 *   patch:
 *     summary: Update tasks by ID array
 *     tags: [Tasks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ids]
 *             properties:
 *               ids:
 *                 type: array
 *                 items: { type: integer }
 *                 example: [1, 2, 3]
 *               isCompleted: { type: boolean, example: true }
 *               priority: { type: string, enum: [low, medium, high] }
 *               trash: { type: boolean }
 *     responses:
 *       200:
 *         description: Tasks updated
 *   delete:
 *     summary: Move tasks to trash by ID array
 *     tags: [Tasks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ids]
 *             properties:
 *               ids:
 *                 type: array
 *                 items: { type: integer }
 *                 example: [1, 2, 3]
 *     responses:
 *       200:
 *         description: Tasks moved to trash
 */

/**
 * @openapi
 * /api/tasks/trash:
 *   delete:
 *     summary: Permanently delete all trashed tasks
 *     tags: [Tasks]
 *     responses:
 *       200:
 *         description: Trash emptied
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string, example: "Work" }
 *     responses:
 *       201:
 *         description: Folder created
 */
