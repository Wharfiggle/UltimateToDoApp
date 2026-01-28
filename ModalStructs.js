import React from "react";
import { StyleSheet, Text, View, TouchableOpacity, TextInput } from "react-native";
import { Hour, Minute, Ampm, Time, TimeFromSecs, TimePeriod, SecsSinceMidnight } from "./TimeStructs.js";
import CoolFreakingButton from "./CoolFreakingButton.js";

//class used to help with structuring Modal data sets for use in ModalNodes
export default class Modal
{
    constructor(data, base)
    {
        this.content = data.content ? data.content : base.content; //render logic, passed actions: {complete(result), cancel()}
        this.onComplete = data.onComplete ? data.onComplete : base.onComplete; //called and passed result from actions.complete(result)
        this.onCancel = data.onCancel ? data.onCancel : base.onCancel; //called on actions.cancel()
        this.listener = data.listener ? data.listener : base.listener; //meant to be set to a setter from React.useState(), called and passed result from actions.complete(result)
        this.inputs = data.inputs ? data.inputs : base.inputs; //object, pass misc data to modal like default values
    }
}

//creates dark background behind provided content
export function darkBackground(subcontent)
{
    return (<View style={{...StyleSheet.absoluteFillObject, position:"absolute",
        alignItems:"center", justifyContent:"center", backgroundColor:"rgba(0,0,0,0.5)"}}>
        { subcontent }
    </View>)
}

//Modal data sets

//default modal values that will be used if any aren't defined by a Modal data set
export function defaultModal(setState, getState)
{
    return {
        content: (actions, inputs) => { return darkBackground(<Text style={{color:"red"}}>default</Text>) },
        onComplete: (result) => { setState({ modalStack: getState().modalStack.dropLast() }) },
        onCancel: () => { setState({ modalStack: getState().modalStack.dropLast() }) },
        listener: null,
        inputs: {}
    };
}

//modal for creating a new task
export function newTaskModal(setState, getState)
{
    return new Modal({
        content: (actions) => {
            const [startTime, setStartTime] = React.useState(new Time(9, 0, "AM"));
            const [endTime, setEndTime] = React.useState(new Time(5, 0, "PM"));
            return ( darkBackground(
                <View style={{width:250, height:200, padding:32, backgroundColor:"white", borderRadius:20, gap:16}}>
                    <View style={{flexDirection:"row", right:-32, top:-32, marginBottom:-32}}>
                        <View style={{flex: 1}}></View>
                        <CoolFreakingButton icon="close-thick" contentStyle={{fontSize:20, color:"skyblue"}} onPress={ ()=>{actions.cancel()} }/>
                    </View>
                    <TouchableOpacity style={{flexDirection:"row"}} onPress={ ()=>{
                            setState({modalStack: getState().modalStack.push({ ...timePickerModal(setState, getState), listener: setStartTime, inputs: {time: startTime} })}) } }>
                        <Text>Start time: </Text>
                        <View style={{borderWidth:1, borderColor:"black"}}><Text>{startTime.toString()}</Text></View>
                    </TouchableOpacity>
                    <TouchableOpacity style={{flexDirection:"row"}} onPress={ ()=>{
                            setState({modalStack: getState().modalStack.push({ ...timePickerModal(setState, getState), listener: setEndTime, inputs: {time: endTime} })}) } }>
                        <Text>End time: </Text>
                        <View style={{borderWidth:1, borderColor:"black"}}><Text>{endTime.toString()}</Text></View>
                    </TouchableOpacity>
                    <CoolFreakingButton title="submit" style={{backgroundColor:"skyblue", borderRadius:10}} onPress={ () => {
                        actions.complete({timePeriod: new TimePeriod(startTime, endTime)});
                    } }/>
                </View>
            ) )
        },
        onComplete: (result) => {
            defaultModal(setState, getState).onComplete();
            setState({ tasks: getState().tasks.concat(result.timePeriod) });
        }
    }, defaultModal(setState, getState));
}

//modal for picking a time of the day
export function timePickerModal(setState, getState)
{
    return new Modal({
        content: (actions, inputs) => {
            const [hour, setHour] = React.useState(String(inputs.time.hour));
            const [minute, setMinute] = React.useState(String(inputs.time.minute));
            const [ampm, setAmpm] = React.useState(String(inputs.time.ampm));
            return (
                <View style={{top:-200, backgroundColor:"white", borderRadius:10, padding:10, gap:10}}>
                    <View style={{flexDirection:"row", alignItems:"center"}}>
                        <TextInput style={{width:25}} value={hour} onBlur={ ()=>{setHour(String(new Hour(hour)))} } maxLength={2} keyboardType="numeric" onChangeText={setHour}/>
                        <Text>:</Text>
                        <TextInput style={{width:25}} value={minute} onBlur={ ()=>{setMinute(String(new Minute(minute)))} } maxLength={2} keyboardType="numeric" onChangeText={setMinute}/>
                        <Text> </Text>
                        <TextInput style={{width:30}} value={ampm} onBlur={ ()=>{setAmpm(String(new Ampm(ampm)))} } maxLength={2} onChangeText={setAmpm}/>
                    </View>
                    <CoolFreakingButton title="submit" style={{backgroundColor:"skyblue", borderRadius:10}} onPress={ () => {
                        actions.complete(new Time(hour, minute, ampm));
                    } }/>
                </View>
            )
        }
    }, defaultModal(setState, getState));
}