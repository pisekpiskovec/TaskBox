function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

function setCookie(name, value) {
    document.cookie = name + '=' + value;
}

class NotificationManager {
    /**
     * The constructor function initializes properties for managing reminders in a web application.
     */
    constructor() {
        this.checkInterval = null;
        this.notificationPermission = false;
        this.activeReminders = new Map();
        setCookie('ReminderCheckInterval', 30000);

        this.init();
    }

    /**
     * The `init` function initializes the notification permission, starts reminder checks, and checks
     * for overdue reminders on page load.
     */
    async init() {
        await this.requestNotificationPermission();
        this.startReminderCheck();

        // Check for overdue reminders on page load
        this.checkReminders();
    }

    /**
     * The function `requestNotificationPermission` checks for browser support and requests permission
     * for desktop notifications.
     * @returns The `requestNotificationPermission` function returns a boolean value indicating whether
     * the notification permission was granted or not.
     */
    async requestNotificationPermission() {
        if (!("Notification" in window)) {
            console.warn('This browser does not support desktop notifications');
            return false;
        }

        if (Notification.permission === 'granted') {
            this.notificationPermission = true;
            return true;
        }

        if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            this.notificationPermission = permission === 'granted';
            return this.notificationPermission;
        }

        return false;
    }

    /**
     * The `startReminderCheck` function sets an interval to check for due reminders every 30 seconds
     * based on a specified reminder check interval stored in a cookie.
     */
    startReminderCheck() {
        // Check every 30 seconds for due reminders
        this.checkInterval = setInterval(() => {
            this.checkReminders();
        }, getCookie('ReminderCheckInterval'));

    }

    /**
     * The function `stopReminderCheck` clears the interval set for reminder checking.
     */
    stopReminderCheck() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
    }

    /**
     * The function `checkReminders` asynchronously fetches reminders for tasks, checks if any
     * reminders need to be shown, and manages active reminders.
     * @returns The `checkReminders` function is an asynchronous function that checks for reminders
     * related to tasks. If the notification permission is not granted, the function will return early.
     * Otherwise, it makes a GET request to fetch reminders from the server. If the response is
     * successful, it parses the JSON response and iterates over each task.
     */
    async checkReminders() {
        if (!this.notificationPermission) return;

        try {
            const response = await fetch('task/reminders/get', { method: 'GET' });
            if (!response.ok) {
                throw new Error('Failed to fetch reminders');
            }

            const tasks = await response.json();
            const now = new Date();

            tasks.forEach(task => {
                if (task.reminder && !task.finised) {
                    const reminderTime = new Date(task.reminder);
                    const taskKey = `Task_${task._id}`;

                    if (reminderTime <= now && !this.activeReminders.has(taskKey)) {
                        this.showTaskReminder(task);
                        this.activeReminders.set(taskKey, {
                            taskId: task._id,
                            reminderTime: reminderTime,
                            shown: true
                        });
                    }

                    if (this.activeReminders.has(taskKey)) {
                        const timeDiff = now - reminderTime;
                        if (timeDiff > 3600000) {
                            this.activeReminders.delete(taskKey);
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Error checking reminders:', error);
        }
    }

    /**
     * The function `showTaskReminder` creates a notification for a task with options to mark as
     * complete or snooze.
     * @param task - The `showTaskReminder` function is used to display a notification reminder for a
     * task. The function takes a `task` object as a parameter, which contains information about the
     * task such as `name`, `list_name`, `notes`, and `_id`.
     * @returns The `showTaskReminder` function is returning nothing explicitly. It is a function that
     * creates a notification for a task reminder based on the input task object.
     */
    showTaskReminder(task) {
        if (!this.notificationPermission) return;

        const listName = task.list_name || 'No List';
        const notification = new Notification(`Task Reminder: ${task.name}`, {
            body: `List: ${listName}\n${task.notes || 'No additional notes'}`,
            icon: '/assets/web-app-manifest-512x512.png',
            tag: `task_${task._id}`,
            requireInteraction: true,
            actions: [
                {
                    action: 'complete',
                    title: 'Mark Complete'
                },
                {
                    action: 'snooze',
                    title: 'Snooze 15min'
                }
            ]
        });

        notification.onclick = () => {
            window.focus();
            this.openTask(task._id, task.list);
            notification.close();
        };

        if ('addEventListener' in notification) {
            notification.addEventListener('notificationclick', (event) => {
                event.notification.close();

                if (event.action === 'complete') {
                    this.completeTask(task._id);
                } else if (event.action === 'snooze') {
                    this.snoozeTask(task._id, 15);
                } else {
                    window.focus();
                    this.openTask(task._id, task.list);
                }
            });
        }

        setTimeout(() => {
            notification.close();
        }, 10000);
    }

    /**
     * The function `completeTask` marks a task as completed by sending a PUT request with the task ID
     * and updating the UI if successful.
     * @param taskID - The `taskID` parameter in the `completeTask` function represents the unique
     * identifier of the task that needs to be marked as completed. This identifier is used to specify
     * which task should be updated when the function is called.
     */
    async completeTask(taskID) {
        try {
            const params = new URLSearchParams({
                'finished': 1,
                'id': taskID
            });

            const response = await fetch('task/task/edit', {
                method: 'PUT',
                body: params.toString(),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                }
            });

            if (response.ok) {
                console.log('Task marked as completed from notification');
                this.activeReminders.delete(`task_${taskID}`); // Remove active reminders

                if (typeof ReloadListContent === 'function') {
                    ReloadListContent(getCookie('lID'));
                }
            }
        } catch (error) {
            console.error('Error completing task:', error);
        }
    }

    /**
     * The function `snoozeTask` asynchronously updates a task reminder time by a specified number of
     * minutes.
     * @param taskID - The `taskID` parameter is the unique identifier of the task that you want to
     * snooze. It is used to identify the specific task that you want to update the reminder for.
     * @param minutes - The `minutes` parameter in the `snoozeTask` function represents the number of
     * minutes by which the task should be snoozed. This value is used to calculate the new reminder
     * date by adding the specified number of minutes to the current date and time.
     */
    async snoozeTask(taskID, minutes) {
        try {
            const newReminderDate = new Date();
            newReminderDate.setMinutes(newReminderDate.getMinutes() + minutes);

            const params = new URLSearchParams({
                'reminder': newReminderDate.toISOString().slice(0, 19).replace('T', ' '),
                'id': taskID
            });

            const response = await fetch('task/task/edit', {
                method: 'PUT',
                body: params.toString(),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                }
            });

            if (response.ok) {
                console.log(`Task snoozed for ${minutes} minutes`);
                this.activeReminders.delete(`task_${taskID}`); // Remove from active reminders so it can trigger again
            }
        } catch (error) {
            console.error('Error snoozing task:', error);
        }
    }

    /**
     * The `openTask` function sets cookies with task and list IDs and navigates to the corresponding
     * page.
     * @param taskID - The `taskID` parameter is the unique identifier of a specific task that you want
     * to open. It is used to set a cookie with the task ID and then navigate to the corresponding task
     * page.
     * @param listID - The `listID` parameter in the `openTask` function represents the ID of a list.
     * It is used to set a cookie with the list ID and navigate to a specific URL based on the list ID
     * provided. If the `listID` is not provided or is equal to '0',
     */
    openTask(taskID, listID) {
        // Set cookies and navigate to them
        setCookie('tID', taskID);
        if (listID && listID !== '0') {
            setCookie('lID', listID);
            window.location.href = `/?list=${listID}`;
        } else {
            window.location.href = `/`;
        }
    }

    /**
     * The clearReminder function removes a reminder for a specific task based on its ID.
     * @param taskID - The `taskID` parameter is a unique identifier for the reminder task that needs
     * to be cleared.
     */
    clearReminder(taskID) {
        this.activeReminders.delete(`task_${taskID}`);
    }

    /**
     * The function `testNotification` checks if notifications are enabled and displays a test
     * notification if they are, otherwise it alerts the user to enable notifications in their browser
     * settings.
     */
    testNotification() {
        if (this.notificationPermission) {
            new Notification('Test notification', {
                body: 'Task reminders are working correctly!',
                icon: 'assets/web-app-manifest-512x512.png'
            });
        } else {
            alert('Notifications are not enabled. Please enable them in your browser settings.');
        }
    }

    /**
     * The `destroy` function stops reminder checks and clears active reminders.
     */
    destroy() {
        this.stopReminderCheck();
        this.activeReminders.clear();
    }
}

window.addEventListener('load', function () {
    if ('Notification' in this.window && Notification.permission === 'default') {
        Notification.requestPermission().then(function (permission) {
            if (permission === 'granted') {
                console.log('Notification permission granted');
            }
        });
    }
});