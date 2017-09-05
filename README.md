# nest-monitor

This is the code backing for the nest temperature module. Essentially the idea behind this is to create a psuedo dual zone climate control for a house only having one zone (ex upstairs vs downstairs). 

To achieve this I monitor the nest thermostat for its current state (temperature target, current temperature, auto away) and compare that to the sensor in the raspberry pi.

The basic logic is simply this. 
- If the nest is away or auto_away don't do anything
- If the nest is currently running the fan don't do anything
- If the nest target temperature and current temperature are too far apart don't do anything. This generally means the nest is about to run automatically and I prefer not to interfere.
- If the nest isn't doing any of those and the pi sensor is far enough away in temperature from the nest temperature then we will run the fan, else not.  *Note about this current implementation the ordeirng of these matters because I use the target temperature not the current temperature as current will always fluctuate slightly for example 20c target might be 19.5 actual which makes somethings harder to work with. I may change my veiw of this in the future.*


The current state is initial testing/proof of concept. 
