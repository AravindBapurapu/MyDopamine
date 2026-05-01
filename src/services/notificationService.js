// Notification and Achievement system
import toast from "react-hot-toast";

class NotificationService {
  /**
   * Show achievement notification
   */
  showAchievement(title, message, icon = "🎉") {
    toast.custom((t) => (
      <div
        className={`${
          t.visible ? "animate-in" : "animate-out"
        } max-w-md w-full bg-gradient-to-r from-violet-500 to-indigo-600 text-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
      >
        <div className="flex-1 w-0 p-4 flex items-center">
          <span className="text-2xl mr-3">{icon}</span>
          <div className="flex-1">
            <p className="text-sm font-bold">{title}</p>
            <p className="mt-1 text-sm opacity-90">{message}</p>
          </div>
        </div>
      </div>
    ));
  }

  /**
   * Show milestone notification
   */
  showMilestone(habitName, milestone) {
    const messages = {
      7: { msg: "7 day streak! 🔥", icon: "🔥" },
      14: { msg: "2 week streak! 🚀", icon: "🚀" },
      21: { msg: "3 week streak! 💪", icon: "💪" },
      30: { msg: "1 month complete! 👑", icon: "👑" },
      50: { msg: "50 day streak! ⭐", icon: "⭐" },
      100: { msg: "100 day streak! 🏆", icon: "🏆" },
    };

    const milestoneData = messages[milestone];
    if (milestoneData) {
      this.showAchievement(
        `${habitName} Milestone`,
        milestoneData.msg,
        milestoneData.icon
      );
    }
  }

  /**
   * Show completion celebration
   */
  showCompletion(percent) {
    const messages = {
      25: { msg: "25% done today! 📈", icon: "📈" },
      50: { msg: "Halfway there! 💯", icon: "💯" },
      75: { msg: "Almost perfect! 🎯", icon: "🎯" },
      100: { msg: "Perfect day! 🌟", icon: "🌟" },
    };

    for (const [threshold, data] of Object.entries(messages)) {
      if (percent === parseInt(threshold)) {
        this.showAchievement(
          "Daily Progress",
          data.msg,
          data.icon
        );
        break;
      }
    }
  }

  /**
   * Show streak warning
   */
  showStreakWarning(habitName, streakDays) {
    toast((t) => (
      <div
        className={`${
          t.visible ? "animate-in" : "animate-out"
        } max-w-md w-full bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex items-center">
            <span className="text-2xl mr-3">⚠️</span>
            <div className="flex-1">
              <p className="text-sm font-bold">Streak at Risk!</p>
              <p className="mt-1 text-sm opacity-90">
                Complete "{habitName}" to keep your {streakDays} day streak alive!
              </p>
            </div>
          </div>
        </div>
      </div>
    ), {
      duration: 6000,
    });
  }

  /**
   * Show reminder notification
   */
  showReminder(habitName) {
    toast((t) => (
      <div
        className={`${
          t.visible ? "animate-in" : "animate-out"
        } max-w-md w-full bg-gradient-to-r from-blue-400 to-cyan-500 text-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex items-center">
            <span className="text-2xl mr-3">🔔</span>
            <div className="flex-1">
              <p className="text-sm font-bold">Time to Track!</p>
              <p className="mt-1 text-sm opacity-90">
                Don't forget to complete "{habitName}"
              </p>
            </div>
          </div>
        </div>
      </div>
    ), {
      duration: 5000,
    });
  }

  /**
   * Show personal record
   */
  showPersonalRecord(habitName, newRecord) {
    this.showAchievement(
      "Personal Record!",
      `New streak for "${habitName}": ${newRecord} days! 🏅`,
      "🏅"
    );
  }
}

export default new NotificationService();
