import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, FlatList, View, TouchableOpacity, TextInput } from "react-native";
import CoolFreakingButton from "./CoolFreakingButton.js";
import ModalNode from "./ModalNode.js";
import React from "react";
import LinkedList from "./LinkedList.js";


//class used to help with structuring modals for use in ModalNodes
class Modal
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


//group of classes used to constrain time inputs to be valid
class Hour
{
	constructor(value)
	{
		this.value = parseInt(value);
		if(isNaN(this.value) || this.value < 1)
			this.value = 1;
		else if(this.value > 12)
			this.value = 12;
	}
	valueOf() { return this.value; }
	toString() { return String(this.value); }
}
class Minute
{
	constructor(value)
	{
		this.value = parseInt(value);
		if(isNaN(this.value) || this.value < 0)
			this.value = 0;
		else if(this.value > 59)
			this.value = 59;
	}
	valueOf() { return this.value; }
	toString() { return String(this.value).padStart(2, '0'); }
}
class Ampm
{
	constructor(str)
	{ this.value = str.toLowerCase() != "pm" ? "AM" : "PM"; }
	toString() { return this.value; }
}


//time of day ex: 9:00 AM, 5:00 PM
class Time
{
	constructor(hour, minute, ampm, totalSecs = null)
	{
		this.hour = new Hour(hour);
		this.minute = new Minute(minute);
		this.ampm = new Ampm(ampm);
		if(totalSecs != null)
			this.totalSecs = totalSecs;
		else
			this.totalSecs = (hour == 12 && ampm == "AM" ? 0 : hour * 3600)
				+ (minute * 60)
				+ (ampm == "PM" && hour != 12 ? 43200 : 0);
	}

	toString()
	{ return `${this.hour}:${String(this.minute).padStart(2, '0')} ${this.ampm}` }
	
	valueOf()
	{ return this.totalSecs }
}
//alternate Time constructor
function TimeFromSecs(totalSecs)
{
	let hour = totalSecs / 3600;
	let ampm = hour >= 12 ? "PM" : "AM";
	hour = (hour % 12) || 12;
	let minute = (totalSecs % 3600) / 60;
	return new Time(hour, minute, ampm, totalSecs);
}


//start Time and end Time within a day, ex: 9:00 AM - 5:00 PM
class TimePeriod
{
	constructor(start, end)
	{
		this.start = start;
		this.end = end;
		if(start > end)
		{
			this.start = end;
			this.end = start;
		}
		this.length = this.end - this.start;
	}

	toString()
	{ return this.start + " - " + this.end }
	
	valueOf()
	{ return this.length }
}

//gets the current amount of seconds since the start of the current day
function SecsSinceMidnight()
{
	let now = new Date();
	let today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	return (now - today) / 1000;
}


export default class App extends React.Component
{
	constructor(props)
	{
		super(props);

		this.state = {
			tasks: [],
			listHeight: 0,
			timeMarkerPos: 0,
			modalStack: new LinkedList() //linked list of Modals for use in ModalNode
		}

		this.listPeriod = new TimePeriod(TimeFromSecs(0), new Time(11, 59, "PM"));

		this.timeMarkerInterval = setInterval(this.timeMarkerUpdate, 1000);
	}

	componentWillUnmount()
	{
	}

	componentDidMount()
	{
		this.setState({ tasks: [
			new TimePeriod(TimeFromSecs(0), new Time(8, 0, "AM")),
			new TimePeriod(new Time(12, 0, "PM"), new Time(8, 0, "PM"))
		] });
	}

	//called upon rendering task list
	handleListLayout = (e) => {
		this.setState({ listHeight: e.nativeEvent.layout.height });
	}

	timeMarkerUpdate = () => {
		let timeMarkerPos = this.state.listHeight * (SecsSinceMidnight() - this.listPeriod.start) / this.listPeriod;
		timeMarkerPos = Math.max(0, Math.min(this.state.listHeight, timeMarkerPos));
		this.setState({ timeMarkerPos: timeMarkerPos });
	}

	taskRender = ({item, index}) => {
		let taskStyle = styles.task;
		if(this.state.listHeight != 0)
		{
			let secsToNext = 0;
			if(index < this.state.tasks.length - 1)
				secsToNext = this.state.tasks[index + 1].start - item.end;

			taskStyle = {...taskStyle, 
				height: (item.length / this.listPeriod.length) * this.state.listHeight,
				marginBottom: (secsToNext / this.listPeriod.length) * this.state.listHeight
			};
		}

		return (
			<View style = {taskStyle}>
				<Text>{String(item)}</Text>
			</View>
		)
	}

	darkBackground = (subcontent) => {
		return (<View style={{...StyleSheet.absoluteFillObject, position:"absolute",
			alignItems:"center", justifyContent:"center", backgroundColor:"rgba(0,0,0,0.5)"}}>
			{ subcontent }
		</View>)
	}

	//Modal Node stuff

	defaultModal = {
		content: (actions, inputs) => { return this.darkBackground(<Text style={{color:"red"}}>default</Text>) },
		onComplete: (result) => { this.setState({ modalStack: this.state.modalStack.dropLast() }) },
		onCancel: () => { this.setState({ modalStack: this.state.modalStack.dropLast() }) },
		listener: null,
		inputs: {}
	};
	
	newTaskModal = new Modal({
		content: (actions) => {
			const [startTime, setStartTime] = React.useState(new Time(9, 0, "AM"));
			const [endTime, setEndTime] = React.useState(new Time(5, 0, "PM"));
			return ( this.darkBackground(
				<View style={{width:250, height:200, padding:32, backgroundColor:"white", borderRadius:20, gap:16}}>
					<TouchableOpacity style={{flexDirection:"row"}} onPress={ ()=>{
							this.setState({modalStack: this.state.modalStack.push({ ...this.timePickerModal, listener: setStartTime, inputs: {time: startTime} })}) } }>
						<Text>Start time: </Text>
						<View style={{borderWidth:1, borderColor:"black"}}><Text>{startTime.toString()}</Text></View>
					</TouchableOpacity>
					<TouchableOpacity style={{flexDirection:"row"}} onPress={ ()=>{
							this.setState({modalStack: this.state.modalStack.push({ ...this.timePickerModal, listener: setEndTime, inputs: {time: endTime} })}) } }>
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
			this.defaultModal.onComplete();
			this.setState({ tasks: this.state.tasks.concat(result.timePeriod) });
		}
	}, this.defaultModal);

	//modal for picking a time of the day
	timePickerModal = new Modal({
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
	}, this.defaultModal);


	render()
	{
		return (
			<View style={styles.container}>
				<View style={styles.subcontainer}>
					<StatusBar/>
					<View style={{flex:1, borderWidth:2, borderColor:"black"}} onLayout={this.handleListLayout}>
						<FlatList
							data={this.state.tasks}
							renderItem={this.taskRender}
							keyExtractor={(item, index) => index}
							ItemSeparatorComponent={(<View style={{height:1, backgroundColor:"black"}}></View>)}
						/>
						<View style={{position:"absolute", width: 100, top: this.state.timeMarkerPos - 1, height:2, backgroundColor:"red"}}></View>
					</View>
					<CoolFreakingButton iconAwesome="plus" contentStyle={{fontSize:24}} style={{height:50, width:50, borderRadius:50, borderWidth:2}} 
						onPress={()=>{ this.setState({modalStack: this.state.modalStack.push(this.newTaskModal)}) }}/>
				</View>
				<ModalNode node = {this.state.modalStack.head}/>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container:{
		flex:1,
		justifyContent:"center",
		alignItems:"center",
		backgroundColor:"black"
	},
	subcontainer:
	{
		width: 336,
		height: 690,
		alignItems: "center",
		justifyContent: "center",
		gap: 16
	},
	task:{
		width:300,
		backgroundColor:"white",
		justifyContent:"center",
		alignItems:"center"
	}
});
