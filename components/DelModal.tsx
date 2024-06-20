import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { rgbaColor } from 'react-native-reanimated/lib/typescript/reanimated2/Colors';
import Modal from 'react-native-modal';

const DelModal = ({ isVisible, onClose, onDelete}) => {
  return (
    
    <Modal
      
      animationIn={'fadeInUp'}
      animationOut={'fadeOutDown'}
      animationInTiming={800}
      animationOutTiming={800}
      isVisible={isVisible}
      useNativeDriver = {true}
      
      
      
    >
    <TouchableOpacity style={{flex: 1,}} onPress={onClose}>
    </TouchableOpacity>
      <View style={{borderColor: "#2b2b2e", borderWidth: 0.5,  width: "100%",alignSelf: "center",alignItems: "center",  height: 100, backgroundColor: "#171717", borderRadius: 4}}>
        
          
          <TouchableOpacity
            style={{ height: 50,width: "95%", borderBottomColor: "#2b2b2e", borderBottomWidth: 0.5, justifyContent: "center"}}
            onPress={onDelete}
          >
            <Text style={{fontSize: 16, alignSelf: "center", color: "red", fontFamily: "Noto Sans Mono Thin"}}>Remove</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{height: 50, width: "95%", justifyContent: "center", }}
            onPress={onClose}
          >
            <Text style={{fontSize: 16, alignSelf: "center", fontFamily: "Noto Sans Mono Thin"}}>Cancel</Text>
          </TouchableOpacity>
        
      </View>
      
    </Modal>
    
  );
};

export default DelModal;
