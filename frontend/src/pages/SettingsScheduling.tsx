import { Helmet } from 'react-helmet';
import Notifications from '../components/Notifications';
import SettingsNavigation from '../components/SettingsNavigation';
import Button from '../components/Button';
import PaginationDummy from '../components/PaginationDummy';
import { useEffect, useState } from 'react';
import loadSchedule, { ScheduleResponseType } from '../api/loader/loadSchedule';
import loadAppriseNotification from '../api/loader/loadAppriseNotification';

type CronTabType = {
  minute: number;
  hour: number;
  day_of_week: number;
};

type SchedulerErrorType = {
  errors: string[];
};

type NotificationItemType = {
  task: string;
  notification: {
    title: string;
    urls: string[];
  };
};

type SettingsSchedulingResponseType = {
  update_subscribed: {
    crontab: CronTabType;
  };
  check_reindex: {
    crontab: CronTabType;
    task_config: {
      days: 0;
    };
  };
  thumbnail_check: {
    crontab: CronTabType;
  };
  download_pending: {
    crontab: CronTabType;
  };
  run_backup: {
    crontab: CronTabType;
    task_config: {
      rotate: false;
    };
  };
  notifications: {
    items: NotificationItemType[];
  };
  scheduler_form: {
    update_subscribed: SchedulerErrorType;
    download_pending: SchedulerErrorType;
    check_reindex: SchedulerErrorType;
    thumbnail_check: SchedulerErrorType;
    run_backup: SchedulerErrorType;
  };
};

const SettingsScheduling = () => {
  const [refresh, setRefresh] = useState(false);

  const [scheduleResponse, setScheduleResponse] = useState<ScheduleResponseType>([]);
  const [appriseNotification, setAppriseNotification] = useState([]);

  useEffect(() => {
    (async () => {
      if (refresh) {
        const scheduleResponse = await loadSchedule();
        const appriseNotificationResponse = await loadAppriseNotification();

        setScheduleResponse(scheduleResponse);
        setAppriseNotification(appriseNotificationResponse);

        setRefresh(false);
      }
    })();
  }, [refresh]);

  useEffect(() => {
    setRefresh(true);
  }, []);

  const groupedSchedules = Object.groupBy(scheduleResponse, ({ name }) => name);

  console.log(groupedSchedules);

  const { update_subscribed, download_pending, run_backup, check_reindex, thumbnail_check } =
    groupedSchedules;

  const updateSubscribedSchedule = update_subscribed?.pop();
  const downloadPendingSchedule = download_pending?.pop();
  const runBackup = run_backup?.pop();
  const checkReindexSchedule = check_reindex?.pop();
  const thumbnailCheckSchedule = thumbnail_check?.pop();

  return (
    <>
      <Helmet>
        <title>TA | Scheduling Settings</title>
      </Helmet>
      <div className="boxed-content">
        <SettingsNavigation />
        <Notifications pageName={'all'} />

        <div className="title-bar">
          <h1>Scheduler Setup</h1>
          <div className="settings-group">
            <p>
              Schedule settings expect a cron like format, where the first value is minute, second
              is hour and third is day of the week.
            </p>
            <p>Examples:</p>
            <ul>
              <li>
                <span className="settings-current">0 15 *</span>: Run task every day at 15:00 in the
                afternoon.
              </li>
              <li>
                <span className="settings-current">30 8 */2</span>: Run task every second day of the
                week (Sun, Tue, Thu, Sat) at 08:30 in the morning.
              </li>
              <li>
                <span className="settings-current">auto</span>: Sensible default.
              </li>
            </ul>
            <p>Note:</p>
            <ul>
              <li>
                Avoid an unnecessary frequent schedule to not get blocked by YouTube. For that
                reason, the scheduler doesn't support schedules that trigger more than once per
                hour.
              </li>
            </ul>
          </div>
        </div>
        <form action="{% url 'settings_scheduling' %}" method="POST" name="scheduler-update">
          <div className="settings-group">
            <h2>Rescan Subscriptions</h2>
            <div className="settings-item">
              <p>
                Become a sponsor and join{' '}
                <a href="https://members.tubearchivist.com/" target="_blank">
                  members.tubearchivist.com
                </a>{' '}
                to get access to <span className="settings-current">real time</span> notifications
                for new videos uploaded by your favorite channels.
              </p>
              <p>
                Current rescan schedule:{' '}
                <span className="settings-current">
                  {updateSubscribedSchedule && (
                    <>
                      {updateSubscribedSchedule?.schedule}
                      <Button
                        label="Delete"
                        data-schedule="update_subscribed"
                        onclick="deleteSchedule(this)"
                        className="danger-button"
                      />
                    </>
                  )}

                  {!updateSubscribedSchedule && 'False'}
                </span>
              </p>
              <p>Periodically rescan your subscriptions:</p>

              <input type="text" name="update_subscribed" id="id_update_subscribed" />
            </div>
          </div>
          <div className="settings-group">
            <h2>Start Download</h2>
            <div className="settings-item">
              <p>
                Current Download schedule:{' '}
                <span className="settings-current">
                  {downloadPendingSchedule && (
                    <>
                      {downloadPendingSchedule.schedule}
                      <Button
                        label="Delete"
                        data-schedule="download_pending"
                        onclick="deleteSchedule(this)"
                        className="danger-button"
                      />
                    </>
                  )}

                  {!download_pending && 'False'}
                </span>
              </p>
              <p>Automatic video download schedule:</p>

              <input type="text" name="download_pending" id="id_download_pending" />
            </div>
          </div>

          <div className="settings-group">
            <h2>Refresh Metadata</h2>
            <div className="settings-item">
              <p>
                Current Metadata refresh schedule:{' '}
                <span className="settings-current">
                  {checkReindexSchedule?.schedule}
                  <Button
                    label="Delete"
                    data-schedule="check_reindex"
                    onclick="deleteSchedule(this)"
                    className="danger-button"
                  />
                  {!checkReindexSchedule && 'False'}
                </span>
              </p>
              <p>Daily schedule to refresh metadata from YouTube:</p>

              <input type="text" name="check_reindex" id="id_check_reindex" />
            </div>
            <div className="settings-item">
              <p>
                Current refresh for metadata older than x days:{' '}
                <span className="settings-current">{checkReindexSchedule?.config?.days}</span>
              </p>
              <p>Refresh older than x days, recommended 90:</p>

              <input type="number" name="check_reindex_days" id="id_check_reindex_days" />
            </div>
          </div>

          <div className="settings-group">
            <h2>Thumbnail Check</h2>
            <div className="settings-item">
              <p>
                Current thumbnail check schedule:{' '}
                <span className="settings-current">
                  {thumbnailCheckSchedule?.schedule}
                  <Button
                    label="Delete"
                    data-schedule="thumbnail_check"
                    onclick="deleteSchedule(this)"
                    className="danger-button"
                  />

                  {!thumbnailCheckSchedule && 'False'}
                </span>
              </p>
              <p>Periodically check and cleanup thumbnails:</p>

              <input type="text" name="thumbnail_check" id="id_thumbnail_check" />
            </div>
          </div>
          <div className="settings-group">
            <h2>ZIP file index backup</h2>
            <div className="settings-item">
              <p>
                <i>
                  Zip file backups are very slow for large archives and consistency is not
                  guaranteed, use snapshots instead. Make sure no other tasks are running when
                  creating a Zip file backup.
                </i>
              </p>
              <p>
                Current index backup schedule:{' '}
                <span className="settings-current">
                  {runBackup && (
                    <>
                      {runBackup.schedule}
                      <Button
                        label="Delete"
                        data-schedule="run_backup"
                        onclick="deleteSchedule(this)"
                        className="danger-button"
                      />
                    </>
                  )}

                  {!runBackup && 'False'}
                </span>
              </p>
              <p>Automatically backup metadata to a zip file:</p>

              <input type="text" name="run_backup" id="id_run_backup" />
            </div>
            <div className="settings-item">
              <p>
                Current backup files to keep:{' '}
                <span className="settings-current">{runBackup?.config.days}</span>
              </p>
              <p>Max auto backups to keep:</p>

              <input type="number" name="run_backup_rotate" id="id_run_backup_rotate" />
            </div>
          </div>
          <div className="settings-group">
            <h2>Add Notification URL</h2>
            <div className="settings-item">
              {appriseNotification && (
                <>
                  <p>
                    <Button
                      label="Show"
                      type="button"
                      onclick="textReveal(this)"
                      id="text-reveal-button"
                    />{' '}
                    stored notification links
                  </p>
                  <div id="text-reveal" className="description-text">
                    {appriseNotification?.items?.map(({ task, notification }) => {
                      return (
                        <>
                          <h3 key={task}>{notification.title}</h3>
                          {notification.urls.map((url: string) => {
                            return (
                              <p>
                                <Button
                                  type="button"
                                  className="danger-button"
                                  label="Delete"
                                  data-url={url}
                                  data-task={task}
                                  onclick="deleteNotificationUrl(this)"
                                />
                                <span> {url}</span>
                              </p>
                            );
                          })}
                        </>
                      );
                    })}
                  </div>
                </>
              )}

              {!appriseNotification && <p>No notifications stored</p>}
            </div>
            <div className="settings-item">
              <p>
                <i>
                  Send notification on completed tasks with the help of the{' '}
                  <a href="https://github.com/caronc/apprise" target="_blank">
                    Apprise
                  </a>{' '}
                  library.
                </i>
              </p>
              <select name="task" id="id_task" defaultValue="">
                <option value="">-- select task --</option>
                <option value="update_subscribed">Rescan your Subscriptions</option>
                <option value="extract_download">Add to download queue</option>
                <option value="download_pending">Downloading</option>
                <option value="check_reindex">Reindex Documents</option>
              </select>

              <input
                type="text"
                name="notification_url"
                placeholder="Apprise notification URL"
                id="id_notification_url"
              />
            </div>
          </div>

          <Button type="submit" name="scheduler-settings" label="Update Scheduler Settings" />

          <PaginationDummy />
        </form>
      </div>
    </>
  );
};

export default SettingsScheduling;
