import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Dimensions, SafeAreaView, StatusBar, View, Text,
  TextInput, Animated, Keyboard,
   ActivityIndicator, RefreshControl, FlatList, TouchableOpacity, TouchableWithoutFeedback, }
  from 'react-native';
import AsyncStorage, { useAsyncStorage } from '@react-native-async-storage/async-storage';
import { Double } from 'react-native/Libraries/Types/CodegenTypes';
import Icon from 'react-native-vector-icons/AntDesign';
import Carousel from 'react-native-reanimated-carousel';
import { LineChart, Grid, YAxis, XAxis, AreaChart, } from 'react-native-svg-charts';
import { Line, Svg, LinearGradient, Stop, Defs } from 'react-native-svg';
import * as shape from 'd3-shape';
import { styles } from './styles/styles';
import Modal from 'react-native-modal';
import { Easing, SlideOutDown, useSharedValue, withTiming } from 'react-native-reanimated';
import { toLinearSpace } from 'react-native-reanimated/lib/typescript/reanimated2/Colors';
import DelModal from './components/DelModal';
import StockModal from './components/stockModal';
import { API_KEYS } from '@env';





interface Stock {
  id: string;
  ticker: string;
  name: string;
  price: Double;
  change: Double;
  currency: string;
  peRatio: string | null;
  marketCap: string | null;
  volume: string | null;
}

interface modalData {
  data: number[];
  ticks: number[];
  timestamps: string[];
}

const sleep = (ms: Double) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

const apiKeys = API_KEYS.split(',');

let currentIndex = 0;


const getNextApiKey = () => {
  const apiKey = apiKeys[currentIndex];
  currentIndex = (currentIndex + 1) % apiKeys.length;
  return apiKey;
};

const getMaxValue = (list: any) => {
  if (!Array.isArray(list) || list.length === 0) {
    return "";
  }
  return Math.max(...list).toFixed(2);
};

const getLowestValue = (list: any) => {
  if (!Array.isArray(list) || list.length === 0) {
    return "";
  }
  return Math.min(...list).toFixed(2);
 
};

const saveStocks = async (stocks: Stock[]): Promise<void> => {
  try {
    const stocksJSON = JSON.stringify(stocks);
    await AsyncStorage.setItem('savedStocks', stocksJSON);
    console.log('Osakkeet tallennettu onnistuneesti.');
  } catch (error) {
    console.error('Virhe osakkeiden tallentamisessa:', error);
  }
};

const getStocks = async () => {
  try {
    const storedStocks = await AsyncStorage.getItem('savedStocks');
    return storedStocks ? JSON.parse(storedStocks) : [];
  } catch (error) {
    console.error('Virhe osakkeiden hakemisessa:', error);
    return [];
  }
};


const addStock = async (newStock: Stock) => {
  try {
    // Hae nykyinen salkku
    
      const currentStocks = await getStocks();
      
      let updatedStocks;
    
    
    if (currentStocks) {
      updatedStocks = [...currentStocks, newStock];
      
    }else {
      updatedStocks = [newStock];
    }

    
    
    // Tallenna päivitetty salkku
    await AsyncStorage.setItem('savedStocks', JSON.stringify(updatedStocks));
    console.log('Osakkeet tallennettu onnistuneesti.');
  } catch (error) {
    console.error('Virhe osakkeiden tallentamisessa:', error);
  }
};


const removeStock = async (stockTicker: String) => {
  try {
    // Haetaan nykyinen tallennettu salkku
    const currentStocks: Stock[] = await getStocks();

    // Suodatetaan pois poistettava osake
    const updatedStocks = currentStocks.filter(stock => stock.ticker !== stockTicker);

    // Päivitetään salkku AsyncStorageen
    await AsyncStorage.setItem('savedStocks', JSON.stringify(updatedStocks));
    

    console.log('Osake poistettu onnistuneesti.');
  } catch (error) {
    console.error('Virhe osakkeen poistamisessa:', error);
  }
};




// Kutsu funktioita asynkronisesti
const updatePrices = async () => {
  const stocks = await getStocks();
  console.log(stocks);

  if (stocks.length > 0) { // Varmista, että stocks ei ole tyhjä
    // Jaetaan osakkeet kymmenen osakkeen ryhmiin
    const chunkArray = (array: [], size: Double) => {
      const result = [];
      for (let i = 0; i < array.length; i += size) {
        result.push(array.slice(i, i + size));
      }
      return result;
    };

    const stockChunks: Stock[][] = chunkArray(stocks, 10);

    const options = (tickers: String[]) => ({
      method: 'GET',
      url: 'https://yfapi.net/v6/finance/quote/',
      params: { symbols: tickers.join(',') },
      headers: {
        'x-api-key': getNextApiKey()
      }
    });

    try {
      const allData: any = [];

      for (const chunk of stockChunks) {
        const tickers: String[] = chunk.map(stock => stock.ticker.trim());
        const response = await axios.request(options(tickers));
        const data = response.data.quoteResponse.result;
        allData.push(...data);
      }

      console.log(allData);

      // Päivitetään osakkeiden hinnat ja lisätään PE-arvo, markkina-arvo ja volyymi
      const updatedStocks = stocks.map((stock: Stock)=> {
        const stockData = allData.find((d: any) => d.symbol === stock.ticker);
        console.log(stockData);
        if (stockData) {
          let marketCap = null;
          if (stockData.marketCap) {
            marketCap = stockData.marketCap > 1e9 
              ? `${(stockData.marketCap / 1e9).toFixed(2)}B` 
              : `${(stockData.marketCap / 1e6).toFixed(2)}M`;
          }
          let volume = null;
          if (stockData.regularMarketVolume) {
            volume = `${(stockData.regularMarketVolume / 1e6).toFixed(2)}M`;
          }
          let PE = null;
          if (stockData.trailingPE) {
            PE = (stockData.trailingPE).toFixed(2);
          }
          return {
            ...stock,
            price: parseFloat((stockData.ask || stockData.regularMarketPrice || stock.price || "-").toFixed(2)), // Käytä saatavilla olevaa hintatietoa kahden desimaalin tarkkuudella
            change: parseFloat((stockData.regularMarketChangePercent || 0).toFixed(2)), // Käytä saatavilla olevaa muutostietoa kahden desimaalin tarkkuudella
            currency: stockData.currency || stock.currency, // Käytä valuuttatietoa
            peRatio: PE || null, // PE-arvo
            marketCap: marketCap || "-", // Markkina-arvo
            volume: volume || null // Volyymi
          };
        }
        return stock;
      });

      // Tallennetaan päivitetyt osakkeet takaisin AsyncStorageen
      await saveStocks(updatedStocks);
      console.log(updatedStocks);
    } catch (error) {
      console.error('Virhe API-kutsussa:', error);
    }
  } else {
    console.log('Ei osakkeita päivitettäväksi.');
  }
};



const scaleValue = (value: any, oldMin: any, oldMax: any) => {
  if (value && oldMin && oldMax) {
    return ((value - oldMin) / (oldMax - oldMin)) * (70 - 0) + 0;
  }
  return 10;
};

let ticks;
const App = () => {
  const emptyStock: Stock = {
    id: '',
    ticker: '',
    name: '',
    price: 0,
    change: 0,
    currency: '',
    peRatio: null,
    marketCap: null,
    volume: null,
  };
  
  const [text, setText] = useState('');
  const [textInputFocused, setTextInputFocused] = useState(false);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [searchCompleted, setSearchCompleted] = useState(false);
  const [portfolio, setPortfolio] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(false);
  const [chartLoading, setChartLoading] = useState(false);
  const [homeButtonState, setHomeButton] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalStock, setStock] = useState<Stock>(emptyStock);
  const [refreshing, setRefreshing] = useState(false);
  const [homeState, setHomeState] = useState(true);
  const [latestSearch, setLatestSearch] = useState('');
  const [chartData, setChartData] = useState<any>([]);
  const [modalChart, setModalChart] = useState<modalData>({ data: [1], ticks: [], timestamps: [] });
  const [activeButton, setActiveButton] = useState(1);
  const [isDelModalVis, setDelModalVis] = useState(false);
  const [DelStock, setDelStock] = useState<Stock>();


  const handleLongPress = (stock: Stock) => {
    setDelModalVis(true);
    setDelStock(stock)
    
  };

  const handleDelete = async () => {
    setDelModalVis(false);
    Animated.timing(listOpacity, {
      toValue: 0,
      duration: 200,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
    await sleep(500);
    
    
    await removeStock(DelStock?.ticker || "");
    
    const updatedPortfolio = stocks.filter(stock => stock.ticker !== DelStock?.ticker);
    setPortfolio(updatedPortfolio);
    setStocks(updatedPortfolio);
    
    
    Animated.timing(listOpacity, {
      toValue: 1,
      duration: 200,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
    

    
  };
  
  const handleTimeFramePress = async (id: any) => {
    setActiveButton(id);
    Animated.timing(opacityChart, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      // Tämä callback-funktio suoritetaan, kun animaatio on suoritettu loppuun
      setChartLoading(true);
    });
    if (id === 1) {
      await getModalChartData("1d", modalStock?.ticker);
    }
    else if (id === 2) {
      await getModalChartData("5d", modalStock?.ticker);
    }
    else if (id === 3) {
      await getModalChartData("1mo", modalStock?.ticker);
    }
    else if (id === 4) {
      await getModalChartData("6mo", modalStock?.ticker);
    }
    else if (id === 5) {
      await getModalChartData("1y", modalStock?.ticker);
    }
    else if (id === 6) {
      await getModalChartData("5y", modalStock?.ticker);
    }
    else if (id === 7) {
      await getModalChartData("10y", modalStock?.ticker);
    }
    else if (id === 8) {
      await getModalChartData("ytd", modalStock?.ticker);
    }

    setChartLoading(false);
    Animated.timing(opacityChart, {
      toValue: 1,
      duration: 300,
      
      useNativeDriver: true,
    }).start();
  };
  
  const screenWidth = Dimensions.get('window').width;

  const listOpacity = useRef(new Animated.Value(1)).current;
  
  const searchStocks = async (query: string): Promise<void> => {
    
    Animated.timing(listOpacity, {
      toValue: 0,
      duration: 300,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
      if (refreshing === false) {
        setLoading(true);
      }
      
    


    try {
      const options = {
        method: 'GET',
        url: 'https://yfapi.net/v6/finance/autocomplete',
        params: { query: query, lang: 'en' },
        headers: {
          'x-api-key': getNextApiKey()
        }
      };
  
      const response = await axios.request(options);
      const results = response.data;
      console.log('Hakutulokset:', results["ResultSet"]["Result"]);
  
      // Muunna hakutulokset osakkeiksi
      const stocks: Stock[] = results["ResultSet"]["Result"].map((result: any) => ({
        id: result.symbol,
        ticker: result.symbol,
        name: result.name,
        price: null, // Asetetaan hinta alkuarvoksi null
        change: null, // Asetetaan muutos alkuarvoksi null
        currency: "" // Voit asettaa haluamasi valuutan
      }));

      setStocks(stocks);
      setSearchCompleted(true);
      setLoading(false);
      
    

        // Käynnistä näyttämisanimaatio
        Animated.timing(listOpacity, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }).start();
           
        setHomeState(false);
    } catch (error) {
      console.error('Virhe osakkeiden hakemisessa:', error);
      goHome();
      setHomeState(true);
    }
    
  };

  const calculateChange = (data: any) => {

    if (data === undefined) {
      return "0";
    }
    if(data.length < 1) {
      return "0";
    }
    
    const change = ((data[data.length - 1] - data[0]) / data[0]) * 100;
    return change.toFixed(1);
  };

  const findKeyByValue = (object: any, value: any) => {
    return Object.keys(object).find(key => object[key] === value);
  };

  const TICKERS = {"S&P500": '^GSPC', "NASDAQ": '^IXIC', "Dow Jones": '^DJI', "Russell2000": "^RUT"};

  const getChartData = async () => {
    try {
      const carouselTickers = Object.values(TICKERS);
      const comparisons = carouselTickers.slice(1).join(',');

      const response = await axios.get(`https://yfapi.net/v8/finance/chart/${carouselTickers[0]}`, {
        params: {
          comparisons: comparisons,
          range: '1d',
          region: 'US',
          interval: '15m',
          lang: 'en',
          events: 'div,split',
        },
        headers: {
          'x-api-key': getNextApiKey()
        },
      });

      const result = response.data.chart.result[0];
      const filteredClose = result.indicators.quote[0].close.filter((close : number) => close !== null);

      const tickersData: any[] = [
        {
          tckr: result.meta.symbol,
          data: filteredClose,
          change: calculateChange(filteredClose),
        },
        ...result.comparisons.map((comp: any) => {
          // Filter out null close values for comparisons
          const filteredCompClose = comp.close.filter((close : number) => close !== null);
          return {
            tckr: comp.symbol,
            data: filteredCompClose,
            change: calculateChange(filteredCompClose),
          };
        })
      ];

      setChartData(tickersData);
     
    } catch (error) {
      console.error("Error fetching chart data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamps = (timestamps: number[]) => {
    return timestamps.map(timestamp => {
      const date: Date = new Date(timestamp * 1000); // Muunna millisekunneiksi
      const hours = date.getHours().toString().padStart(2, '0'); // Lisää johtava nolla, jos tarve
      const minutes = date.getMinutes().toString().padStart(2, '0'); // Lisää johtava nolla, jos tarve
      return `${hours}:${minutes}`;
    });
  };

  const formatTimestamps2 = (timestamps: number[]) => {
    return timestamps.map(timestamp => {
      const date: Date = new Date(timestamp * 1000); // Muunna sekunneista millisekunneiksi
      const day = date.getDate().toString().padStart(2, '0'); // Lisää johtava nolla, jos tarpeen
      const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Kuukaudet ovat 0-indeksoituja
      return `${day}.${month}`;
    });
  };

  const formatTimestamps3= (timestamps: number[]) => {
    return timestamps.map(timestamp => {
      const date = new Date(timestamp * 1000); // Muunna sekunneista millisekunneiksi
      const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Kuukaudet ovat 0-indeksoituja
      const year = date.getFullYear(); // Palauttaa vuoden nelinumeroisena
      return `${month}.${year}`;
    });
  };

 
  

  const getModalChartData = async (timeRange: String, ticker: String) => {
    let interval = "1d";
    if (timeRange === "1d" || timeRange === "5d") {
      interval = "15m";
    }
    try{
    const response = await axios.get(`https://yfapi.net/v8/finance/chart/${ticker}`, {
        params: {
          range: timeRange,
          region: 'US',
          interval: interval,
          lang: 'en',
          events: 'div,split',
        },
        headers: {
          'x-api-key': getNextApiKey()
        },
      });

      const result = response.data.chart.result[0];
      let dataPoints = result.indicators.quote[0].open;
      let timestamps = result.timestamp;

      
      
      dataPoints = dataPoints.filter((obj: number) => obj !== null);
      timestamps = timestamps.filter((obj: number, index: number) => dataPoints[index] !== null);

      let dataPL = dataPoints.length - 1;
      let indices;
      if (dataPL%2 === 0) {
        indices = [0, (dataPL)/4, (dataPL/4)*2, (dataPL/4)*3, dataPL];
      } else {
        indices = [0, (dataPL)/5, (dataPL/5)*2, (dataPL/5)*4, dataPL];
      }
      

      
      const lastTimestamp= timestamps[timestamps.length - 1];

      const step = Math.floor((timestamps.length-1) / 4);
      let limitedTimestamps = timestamps.filter((_: number, index: number) => index % step === 0);

      

      
      let limitedDataPoints = indices.map(index => dataPoints[index]);

      if (!limitedTimestamps.includes(lastTimestamp)) {
        // Lisää viimeinen datapiste limitedTimestamps-taulukkoon
        limitedTimestamps.push(lastTimestamp);
        limitedTimestamps = limitedTimestamps.filter((_: number, index: number) => index !== 3);
      }

      let formattedTimestamps

      if(timeRange === "1d") {
        formattedTimestamps = formatTimestamps(limitedTimestamps);
      }
      else if (timeRange === "5d" || timeRange === "1mo" || timeRange === "6mo" || timeRange === "ytd") {
        formattedTimestamps = formatTimestamps2(limitedTimestamps);
      } else {
        formattedTimestamps = formatTimestamps3(limitedTimestamps);
      }
      const modalData: modalData = 
        {
          data: dataPoints,
          ticks: limitedDataPoints,
          timestamps: formattedTimestamps
        }
        console.log(modalData);
        setModalChart(modalData);
        
      }catch(error){
        console.error("Error fetching chart data:", error);
      }
      ;}

  const calculateAverage = (data: any) => {
    if (data.length === 0) {
      return 0; // Palauta 0, jos taulukko on tyhjä välttääksesi jakamalla nollalla -virheen
    }
  
    const sum = data.reduce((accumulator: any, currentValue: any) => accumulator + currentValue, 0);
    const average = sum / data.length;
    return average;
  };

  useEffect(() => {
    updatePrices();
    const fetchAndSetStocks = async () => {
      getChartData();
      try {
        const savedStocksJSON = await AsyncStorage.getItem('savedStocks');
        if (savedStocksJSON !== null) {
          const savedStocks: Stock[] = JSON.parse(savedStocksJSON);
          setStocks(savedStocks);
          setPortfolio(savedStocks);
          
        } else {
          console.log('Tallennettuja osakkeita ei löytynyt.');
        }
      } catch (error) {
        console.error('Virhe osakkeiden hakemisessa:', error);
      }
      
    };

    fetchAndSetStocks();
  }, []);

  
  
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('en-US', { day: 'numeric', month: 'long' });

 
  const screenHeight = Dimensions.get('window').height;
  const { width: viewportWidth } = Dimensions.get('window');

  const moveTextInput = useRef(new Animated.Value(0)).current;
  const opacityTitle = useRef(new Animated.Value(1)).current;
  const opacityDate = useRef(new Animated.Value(1)).current;
  const inputWidth = useRef(new Animated.Value(screenWidth * 0.95)).current;
  const searchButtonOpacity = useRef(new Animated.Value(0)).current;
  const searchButtonTranslateX = useRef(new Animated.Value(0)).current;
  const listTranslateY = useRef(new Animated.Value(0)).current;
  const homeButtonOpacity = useRef(new Animated.Value(0)).current;
  const homeButtonHeight = useRef(new Animated.Value(0)).current;
  const opacityChart = useRef(new Animated.Value(0)).current;
  
 
  
  

  const onRefresh = async () => {
    setRefreshing(true);
    Animated.timing(listOpacity, {
      toValue: 0,
      duration: 300,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(async () => {
      if (homeState === true) {
        await getChartData();
        await updatePrices();
        setRefreshing(false);
        const stocks = await getStocks();
        
        setStocks(stocks);
        
      }else {
        setSearchCompleted(true);
        await searchStocks(latestSearch);
        setRefreshing(false);
        
        
        
      }
      
      
      Animated.timing(listOpacity, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start(() => {
        
      });
    });
  };

  const handleSearch = () => {
    if (text.trim() !== '') {
      setHomeButton(true)
      searchStocks(text);
      Keyboard.dismiss();
      setLatestSearch(text);
      setText('');
      
    }
  };

  const updateSearch = (lSearch: string) => {
    searchStocks(lSearch);
    
  }

  const closeModal = () => {
    setIsModalVisible(false);
    opacityChart.setValue(0);
    
  }
  
  
  const goHome = async () => {
    setHomeState(true);
    try {
      const savedStocksJSON = await AsyncStorage.getItem('savedStocks');
      let savedStocks: Stock[] = [];
  
      if (savedStocksJSON !== null) {
        savedStocks = JSON.parse(savedStocksJSON);
      } else {
        console.log('Tallennettuja osakkeita ei löytynyt.');
      }
  
      if (savedStocksJSON !== null) {
        setLoading(true);
        Animated.parallel([
          Animated.timing(homeButtonHeight, {
            toValue: 0,
            duration: 500,
            useNativeDriver: false,
          }),
          Animated.timing(homeButtonOpacity, {
            toValue: 0,
            duration: 300,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          
          Animated.timing(listOpacity, {
            toValue: 0,
            duration: 300,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]).start(async () => {
          
          try {
            // Odota, että hinnat päivitetään ja asetetaan uudet osakkeet
            await updatePrices();
            setSearchCompleted(false);
            setLoading(false);
            setHomeButton(false);

            const savedStocksJSON = await AsyncStorage.getItem('savedStocks');
            if (savedStocksJSON !== null) {
              savedStocks = JSON.parse(savedStocksJSON);
            }
            
  
            setStocks(savedStocks);
            
            
  
            // Käynnistä näyttämisanimaatio
            Animated.timing(listOpacity, {
              toValue: 1,
              duration: 300,
              easing: Easing.in(Easing.quad),
              useNativeDriver: true,
            }).start();
          } catch (error) {
            console.error('Virhe päivittäessä hinnat ja näyttäessä uusi lista:', error);
          }
        });
      } else {
        console.log('Tallennettuja osakkeita ei löytynyt.');
      }
    } catch (error) {
      console.error('Virhe osakkeiden hakemisessa:', error);
    }
  };
  


  useEffect(() => {
    if (searchCompleted) {
      Animated.parallel([

        Animated.timing(homeButtonHeight, {
          toValue: 10, // Haluttu korkeus, esimerkiksi 100
          duration: 500,
          useNativeDriver: false, // Height can't use native driver
        }),
        
        Animated.timing(homeButtonOpacity, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
      }),
      
    
      ]).start();
    }
  }, [searchCompleted]);

  

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      
      () => {
        if (!textInputFocused) {
          Animated.parallel([
            Animated.timing(moveTextInput, {
              toValue: 0,
              easing: Easing.out(Easing.quad),
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(opacityTitle, {
              easing: Easing.in(Easing.quad),
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
            
            Animated.timing(opacityDate, {
              easing: Easing.in(Easing.quad),
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(inputWidth, {
              toValue: screenWidth * 0.8,
              duration: 400,
              useNativeDriver: false,
            }),
            Animated.timing(searchButtonOpacity, {
              toValue: 1,
              easing: Easing.in(Easing.quad),
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(searchButtonTranslateX, {
              toValue: 10,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(listTranslateY, {
              toValue: -80,
              easing: Easing.out(Easing.quad),
              duration: 300,
              useNativeDriver: true,
            }),
          ]).start();
          setTextInputFocused(true);
        }
      }
    );
    
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      
      () => {
        
        if (textInputFocused) {
          Animated.parallel([
            Animated.timing(moveTextInput, {
              toValue: 0,
              easing: Easing.out(Easing.quad),
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(opacityTitle, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(opacityDate, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(inputWidth, {
              toValue: screenWidth * 0.95, // Reset width to original value
              duration: 500,
              useNativeDriver: false,
            }),
            Animated.timing(searchButtonOpacity, {
              toValue: 0,
              duration: 100,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(searchButtonTranslateX, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(listTranslateY, {
              toValue: 0,
              easing: Easing.out(Easing.quad),
              duration: 300,
              useNativeDriver: true,
            }),
          ]).start();
          setTextInputFocused(false);
        }
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [textInputFocused, moveTextInput, opacityTitle, opacityDate, inputWidth, searchButtonOpacity, searchButtonTranslateX, listTranslateY]);


  

  const handleStockPress = async (stock: Stock) => {
    
    
    setIsModalVisible(true);
    setStock(stock);
    setActiveButton(1);
    
    

    await getModalChartData("1d", stock.ticker);
    setChartLoading(false);
    console.log(isModalVisible);
    Animated.timing(opacityChart, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
      // Tämä callback-funktio suoritetaan, kun animaatio on suoritettu loppuun
     
    
    
    
      
    
  };

  const isStockInPortfolio = (stock: Stock) => {
    if (typeof stock === 'undefined' || portfolio.length === 0 || portfolio === null || stock === null || typeof portfolio === 'undefined') {
      return false; 
    }
    
    for (let i = 0; i < portfolio.length; i++) {
      if (portfolio[i].ticker === stock.ticker) {
        return true; 
      }
    }
    
    return false; 
  };
  
  const handleAddStock = async (item: Stock) => {
    try {
      if (isStockInPortfolio(item)) {
        await removeStock(item.ticker);
        const updatedPortfolio = portfolio.filter(stock => stock.ticker !== item.ticker);
        setPortfolio(updatedPortfolio);
        console.log("onnistui");
      }else {
        await addStock(item);
        if (portfolio.length > 0) {
          setPortfolio([...portfolio, item])
        }else {
          setPortfolio([item]);
        }
        
        console.log("onnistui"); // Käytä spread-syntaksia lisätäksesi uuden osakkeen portfolioon
      }
      
      
    } catch (error) {
      console.error('Error executing functions', error);
    }
  };


  const handleRemoveStock = async (item: Stock) => {
    try {
      if (isStockInPortfolio(item)) {
        await removeStock(item.ticker);
  
        if (homeState) {
          const updatedStocks = stocks.filter(stock => stock.ticker !== item.ticker);
          setPortfolio(updatedStocks);
          setStocks(updatedStocks); // Oletetaan, että stocks ja portfolio ovat samat homeState === true -tilassa
        } else {
          const updatedStocks = stocks.filter(stock => stock.ticker !== item.ticker);
          setStocks(updatedStocks);
        }
  
        console.log("Stock removed successfully");
      } else {
        await addStock(item);
  
        if (homeState) {
          if (portfolio.length > 0) {
            setPortfolio([...portfolio, item]);
            setStocks([...portfolio, item]); // Oletetaan, että stocks ja portfolio ovat samat homeState === true -tilassa
          } else {
            setPortfolio([item]);
            setStocks([item]);
          }
        } else {
          setPortfolio([...portfolio, item]);
          updateSearch(latestSearch);
        }
  
        console.log("Stock added successfully");
      }
    } catch (error) {
      console.error('Error executing functions', error);
    }
  };

  
 
  const renderChartItem = ({ item }: { item: any }) => (
    
    
    <View style={styles.chartContainer}>
      <LineChart
        width={screenWidth*0.45}
        height={70}
        style={styles.chart}
        data={item.data}
        svg={{ stroke: item.change.startsWith('-') ? 'red' : '#4bc73c', strokeWidth: 2 }}
        contentInset={{top: 25, bottom: 10 , left: 1, right: 1}}
      />
      <Svg style={styles.centerLine}>
        <Line
          x1="0"
          y1={scaleValue(calculateAverage(item.data), Math.min(...item.data), Math.max(...item.data))}
          x2="100%"
          y2={scaleValue(calculateAverage(item.data), Math.min(...item.data), Math.max(...item.data))}
          stroke="gray"
          strokeWidth="0.5"
          strokeDasharray={[4, 4]}
        />
      </Svg>
      <View style={styles.textContainer}>
        <Text style={styles.tckr}>{findKeyByValue(TICKERS, item.tckr)}</Text>
        <Text style={[styles.chartChange, { color: item.change.startsWith('-') ? 'red' : '#4bc73c' }]}>{item.change.startsWith('-')? "" : "+"}{item.change}%</Text>
        
      </View>
    </View>
  );


  
  

  return (
    
    
   <SafeAreaView style={styles.container}>
      <StockModal
      isVisible={isModalVisible}
      setIsModalVisible={setIsModalVisible}
      closeModal={closeModal}
      modalStock={modalStock}
      modalChart={modalChart}
      chartLoading={chartLoading}
      opacityChart={opacityChart}
      activeButton={activeButton}
      handleTimeFramePress={handleTimeFramePress}
      handleRemoveStock={handleRemoveStock}
      getMaxValue={getMaxValue}
      getLowestValue={getLowestValue}
      screenWidth={screenWidth}
      calculateChange={calculateChange}
      isStockInPortfolio={isStockInPortfolio}
      
      />
      {homeState === true ?
      <DelModal
        isVisible={isDelModalVis}
        onClose={() => setDelModalVis(false)}
        onDelete={handleDelete}
        
      /> : ""}



      <StatusBar backgroundColor={"#1B1B1D"} barStyle="light-content"/>
        <Animated.View style={[styles.carouselPos, {opacity: opacityTitle, transform: [{ translateY: listTranslateY }]}]}>
          
            <Carousel
              
              loop
              data={chartData}
              renderItem={renderChartItem}
              width={screenWidth*0.45}
              
              height={70}
              autoPlay={true}
              
              
            
              
              autoPlayInterval={6000}
              maxScrollDistancePerSwipe={200}
              scrollAnimationDuration={1500}
              
              
              onSnapToItem={(index) => console.log('current index:', index)}
            />
              </Animated.View>
      
      <TouchableWithoutFeedback style={{flex: 1}} onPress={Keyboard.dismiss}>

      
        <Animated.View style={[styles.header, { transform: [{ translateY: listTranslateY }] }]}>
        <View style={styles.row}>
          <Animated.Text style={[styles.title, { opacity: opacityTitle }]}>STOCKS</Animated.Text>
          
        </View>
          

          <Animated.Text style={[styles.date, { opacity: opacityDate }]}>{formattedDate}</Animated.Text>
          <Animated.View style={[styles.inputContainer, { transform: [{ translateY: 0}] }]}>
            <Animated.View style={[styles.inputWrapper, { width: inputWidth,  }, ]}>
              <TextInput
                style={styles.input}
                placeholder="Stocks or symbols"
                value={text}
                onChangeText={setText}
                onFocus={() => {}}
                onBlur={() => {}}
                onSubmitEditing={handleSearch}
              />
            </Animated.View>
            
            <Animated.View style={[styles.searchButton, { opacity: searchButtonOpacity, transform: [{ translateX: searchButtonTranslateX }] }]}>
              <TouchableOpacity style={{padding: 10, paddingBottom: 20, top: 5}} onPress={handleSearch}>
                <Text style={styles.searchButtonText}>Search</Text>
              </TouchableOpacity>
            
            </Animated.View>
            
          </Animated.View>

          <Animated.View style={{paddingBottom: 10, paddingTop: homeButtonHeight,}}>
            <Animated.View style={{opacity: homeButtonOpacity}}>
              {homeButtonState && (
              <TouchableOpacity style={[styles.homeButton]} onPress={goHome}>
                <View style={{left: 2,}}>
                <Icon name="arrowleft" size={23} color="white"/>
                </View>
              </TouchableOpacity>)}
            </Animated.View>
          </Animated.View>
          {loading && (!refreshing) && (
          <View style={{bottom:10,}}>
            <ActivityIndicator size="large" color="grey" style={styles.loadingIndicator} />
          </View>)}
        
        <Animated.View style={{flex: 1, minHeight: "84%"
        }}>
          
          <FlatList
            contentContainerStyle={{ flexGrow: 1, marginBottom: 1000 }}
            style={{minHeight: "100%", marginBottom: 1000}}
            data={stocks}
            keyExtractor={item => item.id}
            
            renderItem={({ item }) => (
              
              <TouchableOpacity style={{padding: 0, margin:0}} onPress={() => handleStockPress(item)} onLongPress={() => handleLongPress(item)}>
                <Animated.View style={[styles.stockItem, {opacity: listOpacity}]}>
                  <View>
                    <Text style={styles.ticker}>{item.ticker}</Text>
                    <Text numberOfLines={2} style={styles.name}>{item.name}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.price}>{item.price} {item.currency}</Text>
                    {/* Tässä piilotamme muutoskentän, jos osakkeella ei ole hintaa */}
                    {item.price !== null && (
                      <Text style={[styles.change, { backgroundColor: item.change >= 0 ? '#4bc73c' : 'red' }]}>{item.change}%</Text>
                    )}
                  </View>
                  {searchCompleted && (
                  <TouchableOpacity style={{left: 10,width:50, height: 100, alignItems: "center", justifyContent: 'center'}} onPress={() => handleAddStock(item)}>
                    <View style={[styles.addButton, isStockInPortfolio(item) ? styles.inPortfolioButton : styles.notInPortfolioButton]}>
                    {isStockInPortfolio(item) ? <Icon name="minus" size={18} color="#1B1B1D" /> : <Icon name="plus" size={18} color="white" />}
                    </View>
                  </TouchableOpacity>
                )}
                
                
                </Animated.View>
              </TouchableOpacity>
              
            )
          
          }
           
            showsVerticalScrollIndicator={false}
            bounces={true} // Enables the bounce effect
            alwaysBounceVertical={true}
            ListFooterComponent={<View style={{ height: 50,}} />}
            
            
            refreshControl={ // Lisää refreshControl-ominaisuus FlatListiin
              <RefreshControl progressViewOffset={30} progressBackgroundColor={"#1B1B1D"} colors={["white"]} tintColor={"white"} refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
          
          </Animated.View>
          
        </Animated.View>
      </TouchableWithoutFeedback>
      
    </SafeAreaView>
    
    
  );
};



export default App;
