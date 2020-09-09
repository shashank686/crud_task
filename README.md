# crud_task

1) Used Cron to achieve automatic deletion after given time. 

2) Alternative way can be using setInterval for now I have commented that setInterval code.

3)Please Pass duration like for ex if want to pass minutes use in req body
->{
    ....,
    "duration":"3m" // it means 3 minutes
  }
  
 -> h for hours.
 -> d for days.
 ->as i have used my own timeParser function
 
 4) deleteExpiredTask function handles the deletion logic.
 
 5)Used Mongoose to define Schema and MongoDb cloud for DB. 
