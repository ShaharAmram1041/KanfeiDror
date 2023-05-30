import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase_setup/firebase';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import cities from '../Contact_Form_Component/cities.json';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

function DataGraphs() {
  const [reports, setReports] = useState([]);
  const [year, setYear] = useState('');
  const [city, setCity] = useState('');
  const [config, setConfig] = useState({
    chart: {
      type: 'line',
    },
    title: {
      display: true,
      text:'כמויות דיווחים לפי שנה, חודש ועיר',
      style: {
        fontSize: '40px', // Set the font size for the title
      }, 
    },
    xAxis: {
      title: {
        text: 'חודשים',
      },
      categories: [
        'ינואר',
        'פברואר',
        'מרץ',
        'אפריל',
        'מאי',
        'יוני',
        'יולי',
        'אוגוסט',
        'ספטמבר',
        'אוקטובר',
        'נובמבר',
        'דצמבר',
      ],
    },
    yAxis: {
      title: {
        text: 'כמות דיווחים',
      },
    },
    series: [
      {
        name: 'Data',
        data: [1, 5, 3, 4, 8, 8, 8, 8, 8, 8, 8, 8],
      },
    ],
    plotOptions: {
      series: {
        line: {
          color: '#ff0000', // Change the line color
          lineWidth: 2, // Change the line width
        },
      },
    },
  });

  /* reading from firebase */
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'Reports'));
        const newData = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setReports(newData);
      } catch (error) {
        console.error('Error fetching reports: ', error);
      }
    };

    fetchReports();
  }, []);


  /*---------------------------------------------------------------------------------------*/
  /* by city */
  let places = [];
  places = reports
    .map((item) => item['city'])
    .filter((value) => value !== null && value !== '' && !(places.includes(value)));
  const placesCount = places.reduce((countMap, city) => {
    countMap[city] = (countMap[city] || 0) + 1;
    return countMap;
  }, {});

  const countArray = Object.values(placesCount);

  const CityData = {
    labels: places,
    datasets: [
      {
        data: countArray,
        backgroundColor: 'rgba(108,47,212,0.58)',
        borderColor: 'black',
        borderWidth: 1,
      },
    ],
  };
  

  /*---------------------------------------------------------------------------------------*/
  /* by urgency */
  const urgencyArr = reports
    .map((item) => item['urgency'])
    .filter((value) => value !== null && value !== '');
  const countUrgency = urgencyArr.filter((urgency) => urgency === 'דחוף').length;
  const countNotUrgency = urgencyArr.length - countUrgency;

  const UrgencyData = {
    labels: ['דחוף', 'לא דחוף'],
    datasets: [
      {
        data: [countUrgency, countNotUrgency],
        backgroundColor: ['rgba(233, 31, 19, 1)', 'rgba(15, 255, 11, 1)'],
        borderWidth: 1,
      },
    ],
  };

  /*---------------------------------------------------------------------------------------*/
  /* by year and city => months */
  /* when click on the search */
  function handleSearch(event) {
    if(city === ''){
      const filteredReports = reports.filter((item) => {
        const reportYear = new Date(item.date).getFullYear();
        return reportYear.toString() === year.toString();
      });
  
      const monthlyCounts = Array(12).fill(0);
      filteredReports.forEach((item) => {
        const monthIndex = new Date(item.date).getMonth();
        monthlyCounts[monthIndex]++;
      });
  
      const updatedConfig = {
        ...config,
        series: [
          {
            name: 'Data',
            data: monthlyCounts,
          },
        ],
      };
      
      setConfig(updatedConfig);
    }
  
    else{

    const filteredReports = reports.filter((item) => {
      const reportYear = new Date(item.date).getFullYear();
      return reportYear.toString() === year.toString() && item["city"] === city;
    });

    const monthlyCounts = Array(12).fill(0);
    filteredReports.forEach((item) => {
      const monthIndex = new Date(item.date).getMonth();
      monthlyCounts[monthIndex]++;
    });

    const updatedConfig = {
      ...config,
      series: [
        {
          name: 'Data',
          data: monthlyCounts,
        },
      ],
    };
    setConfig(updatedConfig);
  }
  }

  return (
    <div>
      <div>
        <Bar
          style={{
            margin: 'auto',
            padding: '5px',
            width: '80%',
            height: 'auto',
          }}
          data={CityData}
          options={{
            responsive: true,
            plugins: {
              legend: {
                display: false,
                position: 'top' ,
              },
              title: {
                display: true,
                text: 'כמות דיווחים לפי ערים',
                font: {
                  size: 40, // Set the font size for the title
                }, 
              },
            },
          }}
        ></Bar>
      </div>

      <div>
        <br></br>
        <Pie
          style={{
            margin: 'auto',
            padding: '5px',
            width: '400px',
            height: 'auto',
          }}
          data={UrgencyData}
          options={{
            responsive: true,
            plugins: {
              legend: {
                display: true,
                position: 'top' ,
              },
              title: {
                display: true,
                text:'חלוקה של פניות לפי סטטוס דחיפות',
                font: {
                  size: 40, // Set the font size for the title
                }, 
              },
            },
          }}
        ></Pie>
      </div>
      <br></br>
      <br></br>
      <br></br>

      <div>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>

        <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '10px'}}>
          <button
            type="button"
            onClick={handleSearch}
            style={{ height: '40px',width:'90px' ,marginLeft: '10px' ,textAlign: 'center' }}
          >
            חפש
          </button>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '10px' }}>
    <label htmlFor="citySelected" style={{ textAlign: 'center' }}>בחר עיר להצגה</label>
        <select id="citySelected" value={city} dir="rtl" onChange={(event) => setCity(event.target.value) }>
              <option value="" style={{ textAlign: 'center' }}> -- כל הערים --</option>
              {cities.map((city) => (
                <option key={city.name} value={city.name}>
                  {city.name}
                </option>
              ))}  
            </select>
      </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label htmlFor="yearSelect" style={{ textAlign: 'center' }}>בחר שנה להצגה</label>
            <select
              id="yearSelect"
              style={{ height: '40px', marginBottom: '10px' }}
              onChange={(event) => setYear(event.target.value)}
            >
              <option value={parseInt(new Date().getFullYear()) - 5}>
                {parseInt(new Date().getFullYear()) - 5}
              </option>
              <option value={parseInt(new Date().getFullYear()) - 4}>
                {parseInt(new Date().getFullYear()) - 4}
              </option>
              <option value={parseInt(new Date().getFullYear()) - 3}>
                {parseInt(new Date().getFullYear()) - 3}
              </option>
              <option value={parseInt(new Date().getFullYear()) - 2}>
                {parseInt(new Date().getFullYear()) - 2}
              </option>
              <option value={parseInt(new Date().getFullYear()) - 1}>
                {parseInt(new Date().getFullYear()) - 1}
              </option>
              <option value={parseInt(new Date().getFullYear())}>
                {parseInt(new Date().getFullYear())}
              </option>
            </select>
          </div>
  </div>
      <HighchartsReact 
      highcharts={Highcharts} 
      options={config} />
    </div>
    </div>
  );
}

export default DataGraphs;