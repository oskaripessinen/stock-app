import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Animated } from 'react-native';
import Modal from 'react-native-modal';
import { LineChart, Grid, YAxis, XAxis } from 'react-native-svg-charts';

import Icon from 'react-native-vector-icons/FontAwesome5';
import { styles } from '../styles/styles';
import * as shape from 'd3-shape';



      const StockModal = ({ setIsModalVisible, isVisible, closeModal, modalStock, modalChart, chartLoading, opacityChart, activeButton, handleTimeFramePress, handleRemoveStock, getMaxValue, getLowestValue, screenWidth, calculateChange, isStockInPortfolio }) => {
        return (
        <Modal
            
            animationInTiming={800}
            animationOutTiming={600}
            animationIn={'fadeInUp'}
            animationOut={'slideOutDown'}
            hideModalContentWhileAnimating={true}
            
            
            
            onSwipeComplete={() => {setIsModalVisible(false), opacityChart.setValue(0)}}
            swipeDirection="down"
            
        
            useNativeDriver = {false}
            isVisible={isVisible}
            
            
      >
        <TouchableOpacity style={{height: "10%"}} onPress={closeModal}>

        </TouchableOpacity>
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <View style={{top: 15,borderBottomColor: "gray", borderBottomWidth: 2, width: 100, alignSelf: "center"}}></View>
            <View style={styles.stockInfoHeader}>
              <View style={{justifyContent: "center",  width: 250, top: "50%"}}>
                <Text style={{fontSize: 21, fontFamily: "Nothing Font", left: 5, color: "white"}}>{modalStock?.ticker}</Text>
                
              </View>
              <TouchableOpacity style={{bottom: 15, alignSelf: 'flex-end',width:50, height: 80, alignItems: "center", justifyContent: 'center',}} onPress={() => handleRemoveStock(modalStock)}>
                    
                  <View style={[styles.addButton, isStockInPortfolio(modalStock) ? styles.inPortfolioButton : styles.notInPortfolioButton]}>
                    {isStockInPortfolio(modalStock) ? <Icon name="minus" size={24} color="#1B1B1D" /> : <Icon name="plus" size={18} color="white" />}
                  </View>
                    
                </TouchableOpacity>
            </View>
            <View style={{paddingLeft: 15,paddingTop: 15, flexDirection: "row"}}>
              <Text style={{color: "white"}}>{modalChart?.data !== undefined ? (modalChart?.data[modalChart?.data.length-1])?.toFixed(2) : null}</Text>
              <Text style={{left: 10, color: calculateChange(modalChart.data).startsWith("-") ? 'red' : '#4bc73c'}}>{calculateChange(modalChart.data).startsWith("-") ? '' : '+'}{calculateChange(modalChart.data)}%</Text>
            </View>
            <View style={{paddingLeft: 15,paddingTop: 5, flexDirection: "row"}}>
              <Text>{modalStock?.name} ⋅ {modalStock?.currency}</Text>
            </View>
            <View style={{top: 20, flexDirection: "row", justifyContent: "space-between", padding: 5, paddingRight: 15, paddingLeft: 15, borderTopColor: "#2b2b2e", borderTopWidth: 1, width: "95%", alignSelf: "center"}}>
              <TouchableOpacity onPress={() => handleTimeFramePress(1)} style={[[styles.timeFbutton, activeButton === 1 ? styles.activeTimeFButton : null], activeButton === 1 ? styles.activeTimeFButton : null]}>
                <Text style={styles.timeFtext}>1d</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleTimeFramePress(2)} style={[styles.timeFbutton, activeButton === 2 ? styles.activeTimeFButton : null]}>
                <Text style={styles.timeFtext}>5d</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleTimeFramePress(3)} style={[styles.timeFbutton, activeButton === 3 ? styles.activeTimeFButton : null]}>
                <Text style={styles.timeFtext}>1m</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleTimeFramePress(4)} style={[styles.timeFbutton, activeButton === 4 ? styles.activeTimeFButton : null]}>
                <Text style={styles.timeFtext}>6m</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleTimeFramePress(5)} style={[styles.timeFbutton, activeButton === 5 ? styles.activeTimeFButton : null]}>
                <Text style={styles.timeFtext}>1y</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleTimeFramePress(6)} style={[styles.timeFbutton, activeButton === 6 ? styles.activeTimeFButton : null]}>
                <Text style={styles.timeFtext}>5y</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleTimeFramePress(7)} style={[styles.timeFbutton, activeButton === 7 ? styles.activeTimeFButton : null]}>
                <Text style={styles.timeFtext}>10y</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleTimeFramePress(8)} style={[styles.timeFbutton, activeButton === 8 ? styles.activeTimeFButton : null]}>
                <Text style={styles.timeFtext}>ytd</Text>
              </TouchableOpacity>
            </View>
            
            

            <Animated.View style={[styles.modalChart, {opacity: opacityChart,}]}>
            <View style={{flex: 1,}}>
            
            {chartLoading ? ( 
            <ActivityIndicator size="large" color="grey" style={{paddingLeft: "44%", top: "30%", position: "absolute"}}/>) : (
            <LineChart
              
              
              height={320}
              style={{height: 350, width: "96%", paddingRight: 0, paddingBottom: 0,}}
              data={modalChart.data}
              svg={{ stroke: calculateChange(modalChart.data).startsWith("-") ? 'red' : '#4bc73c', strokeWidth: 2 }}
              contentInset={{top: 30, bottom: 20, right: 5, left: 0}}
              numberOfTicks={7}
              curve={shape.curveLinear}
            >

             
              
              <Grid 
                
              

              svg={{
                stroke: 'rgba(43, 43, 46, 0.6)',
                strokeWidth: 1,
                strokeDasharray: [4, 6]
                
              
                
                 
              }}
              
              ticks={modalChart.data}
              />
              
              </LineChart>
            )}
              <View style={{ width: 0.95*screenWidth}}>

              </View>
              
              <XAxis
                style={{width: "100%", bottom: 0, paddingTop: 8, marginTop: 2, }}
                contentInset={{right: 14+(screenWidth*0.02), left: 14+(screenWidth*0.02) }}
                  data={modalChart.timestamps}
                  formatLabel={(value, index) => modalChart.timestamps[index]}
                  
                  svg={{ fill: 'grey', fontSize: 10, fontFamily: "Noto Sans Mono Thin" }}
                  numberOfTicks={5}
                  
                  
                  
                  
                />
              
              </View>
              

              <YAxis
                style={{left: 0,paddingRight: 8,}}
                  data={modalChart.data}
                  contentInset={{ top: 30, bottom: 20, }}
                  svg={{ fill: 'grey', fontSize: 10, fontFamily: "Noto Sans Mono" }}
                  numberOfTicks={7}
                  
                  
                  
                />

              

            
            
            </Animated.View>
            <View style={{borderTopWidth: 1, borderTopColor: "#2b2b2e", top: 60, width: "96%", alignSelf: "center", padding: 10, paddingTop: 30, flexDirection: "row"}}>
              

              <View style={{flexDirection: "column",  justifyContent: "center", width: "50%", paddingRight: 15, borderRightColor: "#2b2b2e", borderRightWidth: 1}}>
              <View style={{flexDirection: "row", alignContent: "space-between", justifyContent: "space-between", paddingHorizontal: 10}}>
                  <Text style={{color: "grey", fontFamily: "Noto Sans Mono Thin", bottom: 0.5, fontSize: 13}}>Open:</Text><Text style={{fontFamily: "Noto Sans Mono Thin", fontSize: 13}}> {modalChart.data[0].toFixed(2)}</Text>
              </View>
              <View style={{flexDirection: "row", alignContent: "space-between", paddingTop: 6, justifyContent: "space-between", paddingHorizontal: 10}}>
                  <Text style={{color: "grey", fontFamily: "Noto Sans Mono Thin", bottom: 0.5, fontSize: 13}}>High:</Text><Text style={{fontFamily: "Noto Sans Mono Thin", fontSize: 13}}> {getMaxValue(modalChart.data)}</Text>
              </View>
              <View style={{flexDirection: "row", alignContent: "space-between", paddingTop: 6, justifyContent: "space-between", paddingHorizontal: 10}}>
                  <Text style={{color: "grey", fontFamily: "Noto Sans Mono Thin", bottom: 0.5, fontSize: 13}}>Low:</Text><Text style={{fontFamily: "Noto Sans Mono Thin", fontSize: 13}}> {getLowestValue(modalChart.data)}</Text>
              </View>
              </View>
              <View style={{flexDirection: "column",  justifyContent: "center", width: "50%", paddingLeft:15}}>
              <View style={{flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 10}}>
                <Text style={{alignSelf: "flex-start",color: "grey", fontFamily: "Noto Sans Mono Thin", bottom: 0.5, fontSize: 13}}>Mkt Cap:</Text><Text style={{fontFamily: "Noto Sans Mono Thin", fontSize: 13, alignSelf: "flex-end"}}>{modalStock?.marketCap !== "" ? modalStock?.marketCap : "-"}</Text>
              </View>
              
              <View style={{flexDirection: "row", paddingTop: 6, justifyContent: "space-between", paddingHorizontal: 10}}>
                <Text style={{color: "grey", fontFamily: "Noto Sans Mono Thin", bottom: 0.5, fontSize: 13}}>Volume:</Text><Text style={{fontFamily: "Noto Sans Mono Thin", fontSize: 13}}>{modalStock?.volume}</Text>
              </View>
              <View style={{flexDirection: "row", paddingTop: 6, alignContent: "space-between", justifyContent: "space-between", paddingHorizontal: 10}}>
                <Text style={{textAlign: "left",color: "grey", fontFamily: "Noto Sans Mono Thin", bottom: 0.5, fontSize: 13}}>P/E:</Text><Text style={{fontFamily: "Noto Sans Mono Thin", fontSize: 13,}}>{(modalStock?.peRatio)}</Text>
              </View>
              </View>
              
            </View>
            </View>
            
        </View>
      </Modal>
        );
      }
      
      export default StockModal;
    
      
      
      
      
      
      
      
      
      