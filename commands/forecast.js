const fetch = require("node-fetch");
const Discord = require('discord.js')
module.exports = {
	name: 'forecast',
	description: 'Weather forecast',
	execute(receivedMessage, arguments) {
        let time = arguments[0];
        let excluding = 'hourly';
        let including = 'daily';
        if(time.endsWith('d')){
             excluding = 'hourly';
             including = 'daily';
             time = time.substr(0, 1);
             time = parseInt(time, 10);
             if(time > 7 || time < 1){
                receivedMessage.channel.send("Number of days has to be between 1 and 7");
                return;
            }
        }
        else if(time.endsWith('h')){
             excluding = 'daily';
             including = 'hourly';
             time = time.substr(0, time.length - 1);
             time = parseInt(time, 10);
             if(time + 2 > 47 || time < 1){
                 receivedMessage.channel.send("Number of hours has to be between 1 and 45");
                 return;
             }
        }
        else{
            receivedMessage.channel.send("You provided wrong time value! Correct usage: d!forecast [xh] [city name] or d!forecast [xd] [city name] where x is the number of hours/days")
        }
        arguments.shift();
		let city = arguments.join(' '); 
		fetch('http://api.openweathermap.org/geo/1.0/direct?q=' + city + '&limit=1&appid=' + process.env.WEATHER_TOKEN)
			.then(response => response.json())
			.then(data => {
                city = data[0].name;
                    fetch('https://api.openweathermap.org/data/2.5/onecall?lat=' + data[0].lat + '&lon='+ data[0].lon +'&units=metric&exclude=current,minutely,'+ excluding.toString() +',alerts&appid=' + process.env.WEATHER_TOKEN)
                    .then(response => response.json())
                    .then(data => {
                        if(including == 'hourly'){
                            let a = new Date(data[including.toString()][time+2]['dt'] * 1000)
                            let weatherHourlyForecast = new Discord.MessageEmbed()
                                .setColor('#00cc99')
                                .setTitle('Weather forecast for ' + city)
                                .setAuthor(receivedMessage.member.displayName, receivedMessage.author.avatarURL())
                                .setThumbnail('https://i.imgur.com/uiFYsou.png')
                                .setDescription(unixToStandard(a))
                                .addFields(
                                    { name: 'Description', value:  data[including.toString()][time+2]['weather'][0]['description']},
                                    { name: 'Cloudiness', value:  data[including.toString()][time+2]['clouds'] + '%'},
                                    { name: 'Daytime temperature', value: parseFloat(data[including.toString()][time+2]['temp']).toFixed(2) + ' °C', inline: true },
                                    { name: 'Feels like', value: parseFloat(data[including.toString()][time+2]['feels_like']).toFixed(2) + ' °C', inline: true },
                                    { name: 'Humidity', value:  data[including.toString()][time+2]['humidity'] + '%'},
                                    { name: 'Pressure', value:  data[including.toString()][time+2]['pressure'] + ' hPa'},
                                    { name: 'Wind speed', value:  data[including.toString()][time+2]['wind_speed'] + ' m/s'},
                                    { name: 'Longitude', value:  data['lon'], inline: true},
                                    { name: 'Latitude', value:  data['lat'], inline: true},
                                )
                                .setFooter('via OpenWeather')
                                .setTimestamp();
                            receivedMessage.channel.send(weatherHourlyForecast);
                        }
                        else{
                           let a = new Date(data[including.toString()][time]['dt'] * 1000)
                           let weatherDailyForecast = new Discord.MessageEmbed()
                                .setColor('#00cc99')
                                .setTitle('Weather forecast for ' + city)
                                .setAuthor(receivedMessage.member.displayName, receivedMessage.author.avatarURL())
                                .setThumbnail('https://i.imgur.com/uiFYsou.png')
                                .setDescription(unixToStandard(a))
                                .addFields(
                                    { name: 'Description', value:  data[including.toString()][time]['weather'][0]['description']},
                                    { name: 'Cloudiness', value:  data[including.toString()][time]['clouds'] + '%'},
                                    { name: 'Daytime temperature', value: parseFloat(data[including.toString()][time]['temp']['day']).toFixed(2) + ' °C', inline: true },
                                    { name: 'Feels like', value: parseFloat(data[including.toString()][time]['feels_like']['day']).toFixed(2) + ' °C', inline: true },
                                    { name: '\u200B', value: '\u200B', inline: true },
                                    { name: 'Nighttime temperature', value: parseFloat(data[including.toString()][time]['temp']['night']).toFixed(2) + ' °C', inline: true },
                                    { name: 'Feels like', value: parseFloat(data[including.toString()][time]['feels_like']['night']).toFixed(2) + ' °C', inline: true },
                                    { name: '\u200B', value: '\u200B', inline: true },
                                    { name: 'Morning temperature', value: parseFloat(data[including.toString()][time]['temp']['morn']).toFixed(2) + ' °C', inline: true },
                                    { name: 'Feels like', value: parseFloat(data[including.toString()][time]['feels_like']['morn']).toFixed(2) + ' °C', inline: true },
                                    { name: '\u200B', value: '\u200B', inline: true },
                                    { name: 'Evening temperature', value: parseFloat(data[including.toString()][time]['temp']['eve']).toFixed(2) + ' °C', inline: true },
                                    { name: 'Feels like', value: parseFloat(data[including.toString()][time]['feels_like']['eve']).toFixed(2) + ' °C', inline: true },
                                    { name: 'Humidity', value:  data[including.toString()][time]['humidity'] + '%'},
                                    { name: 'Pressure', value:  data[including.toString()][time]['pressure'] + ' hPa'},
                                    { name: 'Wind speed', value:  data[including.toString()][time]['wind_speed'] + ' m/s'},
                                    { name: 'Longitude', value:  data['lon'], inline: true},
                                    { name: 'Latitude', value:  data['lat'], inline: true},
                                )
                                .setFooter('via OpenWeather')
                                .setTimestamp();
                            receivedMessage.channel.send(weatherDailyForecast);
                        }
                        function unixToStandard(a){
                            let months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                            let year = a.getFullYear();
                            let month = months[a.getMonth()];
                            let date = a.getDate();
                            let hour = a.getHours();
                            let min = a.getMinutes().toString();
                            let sec = a.getSeconds().toString();
                            let currentDate = date + ' ' + month + ' ' + year + ' ' + hour + ':00';
                            return currentDate;
                        }
                    }).catch(err => console.log(err));
			}).catch(err => receivedMessage.channel.send("You provided wrong city name, didn't provide city name at all or weather forecast is not available for this place"));

}}