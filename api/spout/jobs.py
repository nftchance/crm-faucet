from django.conf import settings

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from django_apscheduler.jobstores import DjangoJobStore

from .models import Spout

scheduler = BackgroundScheduler()

def accept_spouts():
    Spout.objects.accept_spouts()

def delete_old_looked_spouts(max_age=60 * 60):
    Spout.objects.delete_old_looked_spouts(max_age)

scheduler.add_jobstore(DjangoJobStore(), "default")

scheduler.add_job(
    accept_spouts,
    trigger=CronTrigger(hour="*", minute="*/1"),
    id="accept_spouts",
    max_instances=1,
    replace_existing=True,
)

scheduler.add_job(
    delete_old_looked_spouts,
    trigger=CronTrigger(hour="*", minute="*/59"),
    id="delete_old_looked_spouts",
    max_instances=1,
    replace_existing=True,
)

try:
    scheduler.start()
except (KeyboardInterrupt, SystemExit) as e:
    scheduler.shutdown()