import datetime 

MINUTES_TO_STALL = 2
STARTUP_TIME = datetime.datetime.now()

STALLING = STARTUP_TIME + datetime.timedelta(minutes=MINUTES_TO_STALL) < datetime.datetime.now()
