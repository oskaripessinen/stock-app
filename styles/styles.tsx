import { StyleSheet, Dimensions } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1B1B1D',
    
    
  },

  modalBackground: {
    height: "96%",
    top: 10,
    width: Dimensions.get('window').width,
    alignSelf: "center",
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0)',
  },
  modalContent: {
    backgroundColor: '#1B1B1D',
    height: "100%",
    width: "100%",
    
    borderRadius: 10,
    borderTopColor: "#2b2b2e",
    borderRightColor: "#2b2b2e",
    borderLeftColor: "#2b2b2e",
    borderWidth: 0.5
  },
  modalText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  
  },

  modalChart: {
    alignSelf: "center",
    width: "95%", 
    
    borderColor: "#2b2b2e", 
    
    borderTopWidth: 1,
    top: 20,
    
    
    height: 350,
    flexDirection: "row"
  },

  stockInfoHeader: {
    borderBottomColor: "#2b2b2e",
    borderBottomWidth: 1,
    width: "95%",
    
   
    justifyContent: "center",
    alignSelf: "center",
    height: 80,
    
   
  },

  header: {
    flex: 1,
    backgroundColor: '#1B1B1D',
    padding: 'auto',
    paddingHorizontal: 10,
    
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    
  },

  title: {
    fontFamily: 'Nothing Font',
    fontWeight: '600',
    fontSize: 32,
    color: 'white',
    marginBottom: 0,
  },
  carouselPos: {
    borderWidth: 1,
    
   
    borderRadius: 4,
    borderColor: "#2b2b2e",
    position: 'absolute',
    zIndex: 1,
    right: 10,
    top: 5,
    
    
   
    
  },
  carouselItem: {
    
   
    padding: 20,
    top: 100,
   
    justifyContent: 'center',
    alignItems: 'center',
  },

  date: {
    fontSize: 16,
    fontFamily: 'Noto Sans Mono Thin',
    
    marginBottom: 0,
    left: 2,
  },
  inputContainer: {
    margin: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 0,
    
    
  },
  inputWrapper: {
    paddingBottom: 0,
    margin: 0
  },
  input: {
    height: 40,
    margin: 0,
    
    backgroundColor: '#242427',
    borderColor: '#2b2b2e',
    borderRadius: 4,
    borderWidth: 1,
    paddingLeft: 15,
    color: 'white',
  },
  searchButton: {
  
    paddingBottom: 20,
    top: 10,
    
    
    
  },
  searchButtonText: {
    color: 'white',
    right: 5,
  },

 
  stockItem: {
    flexDirection: 'row',
    alignSelf: "center",
    paddingHorizontal: 10,
    margin: 5,
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 100,
    width: "100%",
    borderWidth: 0.5,
    borderRadius: 4,
    borderColor: "#2b2b2e",
    
  },
  ticker: {
    paddingBottom: 5,
    color: 'white',
    fontFamily: 'Nothing Font',
    fontSize: 16,
  },
  name: {
    width: 250,
    lineHeight: 20,
    fontFamily: 'Noto Sans Mono Thin',
  },
  price: {
    color: 'white',
    paddingBottom: 5,
    fontFamily: 'Noto Sans Mono Thin',
  },
  change: {
    color: 'white',
    fontFamily: 'Noto Sans Mono Thin',
    top: 5,
    fontSize: 12,
    minWidth: 60,
    minHeight: 22,
    borderRadius: 4,
    textAlignVertical: 'center',
    textAlign: 'right',
    paddingRight: 4,
    
  },

  loadingIndicator: {
    
    
  },

  homeButtonContainer: {
    borderBottomColor: "grey",
    borderBottomWidth: 1,
  },

  homeButton: {
    
    
    
   
  },

  homeButtonText: {
    
  paddingLeft: 5,
  fontSize: 16,
  
    
  color: "#36AAFA",  
  fontFamily: 'Noto Sans Mono Thin'
  },

  addButton: {
    width: 29,
    height: 29,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: 'white',
    borderWidth: 2.5,
    borderRadius: 15,
  },

  inPortfolioButton: {
    backgroundColor: "white",
  },
  notInPortfolioButton: {

  },

  inPortfolioText: {
    color: "black",
    fontWeight: 'bold',
    fontSize: 16,
    bottom: 0.5, 
  },
  notInPortfolioText: {
    color: "white",
    fontWeight: 'bold',
    fontSize: 18,
    bottom: 0.5, 
  },

  addButtonText: {
    fontSize: 18,
    bottom: 1, 
    fontWeight: 'bold', 
    color: "white"
  },
  chartContainer: {
    
    
    borderColor: "#2b2b2e",
    
    height: 70,
    width: (Dimensions.get('window').width*0.45),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    
  },
  chart: {
    borderLeftWidth: 0.5,
    
    flex :1,
    
    borderColor: "#2b2b2e"
  },
  centerLine: {
    
    position: "absolute",
    
    left: 0,
    right: 0,
  },
  textContainer: {
    position: 'absolute',
    
    flexDirection: 'row',
    
    
    left: 5,
  },
  tckr: {
    color: 'white',
    fontSize: 11,
    fontFamily: 'Nothing Font',
    top: 2
    ,
    
  },
  chartChange: {
    left: 5,
    fontSize: 10,
    fontFamily: 'Noto Sans Mono Thin',
  },

  timeFbutton: {
    marginVertical: 10,
    borderRadius: 4,
    padding: 10, 
    paddingVertical: 4,
    
  },
  activeTimeFButton: {
    backgroundColor: "#2b2b2e",
    
  },
  timeFtext: {
    fontFamily: "Noto Sans Mono Thin",
    fontSize: 12
  }

});


