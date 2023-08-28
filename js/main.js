//Fetches the data.json file from the directory in root folder
fetch('data.json')
.then(response => response.json())  //To retrieve .json file from the api
.then(data =>      //data stores the json file
{

    const dropdown = document.getElementById('dropdown');
    const latLonDisplay = document.getElementById("latlon"); 

    //Eventlister for when the dropdown list is updated by new city select
    dropdown.addEventListener('change', ()=> 
    { 
        //Sores the value which is currently selected in dropdown 
        const selectedValue = dropdown.value;

        //Loop to traverse all the element of the weather block and clear them for new data each time a new city is updated
        for(i=1; i<=8; i++)
        {
            const weatherBlock = document.getElementById(`wblock${i}`);
            weatherBlock.classList.add("weather-red");

            const img_clear = `image${i}`;
            const date_clear = `date${i}`;
            const weathert_clear = `weather_type${i}`;
            const tvalue_clear = `t_value${i}`;
            const clear_all_image=document.getElementById(img_clear).innerHTML="";
            const clear_all_date=document.getElementById(date_clear).innerHTML="";
            const clear_all_weathert=document.getElementById(weathert_clear).innerHTML="";
            const clear_all_tvalue=document.getElementById(tvalue_clear).innerHTML="";
        }

        // Find the selected city in the data array
        const selectedCity = data.find(item => item.city === selectedValue);
        if (selectedCity) 
        {
            const latitude= selectedCity.latitude;
            const longitude  = selectedCity.longitude;
            
            //apiurl contains the api url used to fetch the data from api
            const apiurl = `http://www.7timer.info/bin/api.pl?lon=${longitude}&lat=${latitude}&product=civil&output=json`;
            // Display lat/long
            latLonDisplay.textContent = `Latitude: ${latitude}, Longitude: ${longitude}`;

            
            fetch(apiurl)                               //initiates an HTTP GET request to the URL provided in the apiurl
            .then(apiResponse => apiResponse.json())    //method parses the response body as JSON
            .then(apiData =>                            //receives the parsed JSON data (apiData
            {
                
                //Defining variables for finding average values of a day values and then using them to predict weather
                var h_temp=0,l_temp=70;
                var max_speed=0,direction="",cloud_cover=0,lifted_index=0,prec_amount=0,rh2m="",speed=0,rh2mNumber=0;
                var start_timepoint=0,end_timepoint=0;
                const dataseries = apiData.dataseries;
                
                //Initialising list to store each day data for inserting in the blocks of each day
                let weather_list= [];
                let prec_type =[];
                let high_t_list=[];
                let low_t_list=[];
                let curr_weather=[];
                let weather_showscreen=[];

                //Used in finding date
                const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                const monthNames = ["January", "February", "March", "April", "May", "June", "July",
                "August", "September", "October", "November", "December"];

                //Traversing each element of the dataseries data
                dataseries.forEach(datapoint=>
                {
                    end_timepoint=datapoint.timepoint;
                    //Used to check the each day end since each day has 8 timepoints
                    if((end_timepoint - start_timepoint) <=24)
                    {
                        //stores highest temp of that day
                        if(h_temp<datapoint.temp2m)
                        {
                            h_temp=datapoint.temp2m;
                        }
                        //stores lowest temp of that day
                        if(l_temp>datapoint.temp2m)
                        {
                            l_temp=datapoint.temp2m;
                        }
                        //stores highest speed of wind of that day to use in finding direction of wind
                        if(max_speed<datapoint.wind10m.speed)
                        {
                            max_speed=datapoint.wind10m.speed;
                            direction=datapoint.wind10m.direction;
                        }
                        //adding all 8 timepoint data together
                        cloud_cover+=datapoint.cloudcover;
                        lifted_index+=datapoint.lifted_index;
                        prec_amount=datapoint.prec_amount;
                        rh2m=datapoint.rh2m;
                        rh2mNumber += parseInt(rh2m);
                        speed+=datapoint.wind10m.speed; 

                        //For our further weather finding process
                        prec_type.push(datapoint.prec_type);
                        weather_list.push(datapoint.weather);
                        
                    }
                    //When 1 day ends this triggers
                    if((end_timepoint - start_timepoint) == 24)
                    {
                        //Finding average of the value for a single proper value
                        var win_dir;
                        cloud_cover=(cloud_cover/8);
                        lifted_index= Math.round(lifted_index/8);
                        prec_amount= (prec_amount/8);
                        speed= Math.round(speed/8);
                        rh2mNumber= Math.round(rh2mNumber/8);

                        //Storing high and low temp for later insertion
                        high_t_list.push(h_temp);
                        low_t_list.push(l_temp);

                        //Conditions for finding the weather type proper condition is given in 7timer api documentation link in front page
                        if(rh2mNumber>=90 && cloud_cover< 6.3)
                        {
                            weather_showscreen.push("Foggy");
                            curr_weather.push("fog");
                            //foggy
                        }
                        else if((prec_amount<= 3 && prec_amount > 1) && cloud_cover>=7.8)
                        {
                            weather_showscreen.push("Light Rain");
                            curr_weather.push("lightrain");
                            //light rain or shower
                        }
                        else if((prec_amount<= 3 && prec_amount > 1) && (cloud_cover>=6.2 && cloud_cover<=7))
                        {
                            weather_showscreen.push("Occasional Showers");
                            curr_weather.push("oshower");
                            //ocassional shower
                        }
                        else if((prec_amount<= 3 && prec_amount > 1) && (cloud_cover<= 6.2 && cloud_cover>=2.5))
                        {
                            weather_showscreen.push("Isolated Showers");
                            curr_weather.push("ishower");
                            //isolated showers
                        }
                        else if(prec_amount >= 4 && ((weather_list.includes("snowday") && weather_list.includes("snownight")) ||  (weather_list.includes("rainday") && weather_list.includes("rainnight")) ) && 
                        (prec_type.includes("frzr") || prec_type.includes("icep")))
                        {
                            weather_showscreen.push("Rain with Snow");
                            curr_weather.push("rainsnow");
                            //mixed rainsnow
                        }
                        else if(prec_amount >= 4 && (weather_list.includes("rainday") || weather_list.includes("rainnight")))
                        {
                            weather_showscreen.push("Rain");
                            curr_weather.push("rain");
                            //rain
                        }
                        else if(prec_amount>4 && (weather_list.includes("snowday") || weather_list.includes("snownight")))
                        {
                            weather_showscreen.push("Snow");
                            curr_weather.push("snow");
                            //snow
                        }
                        else if((lifted_index <- 4) && (prec_amount > 1 && prec_amount <=3  ))
                        {
                            weather_showscreen.push("Thunderstorm possible");
                            curr_weather.push("thunder_p");
                            //Thunder possible
                        }
                        else if((lifted_index <- 4) && (prec_amount >= 4 ))
                        {
                            weather_showscreen.push("Thunderstorm");
                            curr_weather.push("thunderstorm");
                            //Thunderstorm
                        }
                        else if( prec_amount> 1 && prec_amount <=3)
                        {
                            weather_showscreen.push("Light or occasional snow");
                            curr_weather.push("lightsnow");
                            //light or ocassional snow
                        }
                        else if(cloud_cover>=3 && cloud_cover < 6.5)
                        {
                            weather_showscreen.push("Partly Cloudy");
                            curr_weather.push("pcloudy");
                            //partly cloudy
                        }
                        else if(cloud_cover >= 6.4 && cloud_cover <= 8)
                        {
                            weather_showscreen.push("Cloudy");
                            curr_weather.push("cloudy");
                            //cloudy
                        }
                        else if(cloud_cover >= 7.9)
                        {
                            weather_showscreen.push("Very Cloudy");
                            curr_weather.push("verycloudy");
                            //very cloudy
                        }
                        else if(speed>5)
                        {
                            weather_showscreen.push("Windy");
                            curr_weather.push("windy");
                            win_dir=direction;
                            //windy
                        }
                        /*else if(cloud_cover <= 3.1)
                        {
                            //clear
                        }*/
                        else
                        {
                            weather_showscreen.push("Clear");
                            curr_weather.push("clear");
                            //clear
                        }

                        //Clearing our list and values for next day use
                        prec_type = [];
                        weather_list= [];
                        start_timepoint=datapoint.timepoint;
                        h_temp=0,l_temp=70;
                        max_speed=0,direction="",cloud_cover=0,lifted_index=0,prec_amount=0,rh2m="",speed=0,rh2mNumber=0;
                    }
                })

                //Loop for inserting all 8 day data
                for(i=1; i<=8; i++)
                {

                    //For image for each div in the page
                    img_label='images/'+curr_weather[i-1]+'.png';
                    const divId = `image${i}`;
                    const div = document.getElementById(divId);
                    
                    // Create an img element and set its src attribute
                    const img = document.createElement('img');
                    img.src = img_label; // Assuming images are in the "images/" directory

                    // Append the img element to the div
                    div.appendChild(img);

                    //For the showing of weather type on the each division
                    const div_w_id = `weather_type${i}`;
                    const div_w = document.getElementById(div_w_id);
                    div_w.textContent = weather_showscreen[i - 1];
                    
                    //For the temp in the weather div high and low
                    const high_t= "High: "+high_t_list[i-1]+" °C";
                    const low_t = "Low: "+low_t_list[i-1]+" °C";
                    const div_t_id = `t_value${i}`;

                    // Inserting High and low temperature tag 
                    const div_t = document.getElementById(div_t_id);
                    div_t.innerHTML=high_t+"<br>"+low_t;

                    //Finding date using Date() function and extracting vlaues from it
                    const today = new Date();
                    const date_content = document.getElementById(`date${i}`); // Assuming you have 8 weather blocks

                    //Used to find future 8 day dates too
                    const futureDate = new Date(today);
                    futureDate.setDate(today.getDate() + i-1);
                    const dd = String(futureDate.getDate()).padStart(2, '0');
                    const mm = String(futureDate.getMonth() + 1).padStart(2, '0');
                    const day = futureDate.getDay();
                    const yyyy = futureDate.getFullYear();

                    //Formatting the date values 
                    const formattedDate = `${dayNames[day]} ${dd} ${monthNames[futureDate.getMonth()]} ${yyyy}`;  
                    // Assuming each weather block has a date element with class "date"
                    date_content.textContent = formattedDate;
                }
            })
            .catch(error => console.error('API Error:', error));    //Catches error if it fails to retrieve the data from api
        }
    });

    //Traverse the json data and stores each element 
    data.forEach(item => 
    {
        //stores city as value and displays city and country in the list
        const option = document.createElement('option');
        option.value = item.city;
        option.textContent = item.city + ", " + item.country;
        dropdown.appendChild(option);
    });
}) 
.catch(error => console.error('Error fetching data:', error));      //If data fetching through data.json encounters some error

