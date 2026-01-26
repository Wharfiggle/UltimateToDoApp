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
	}
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

		this.timePeriod = {start: Date.now(), end: Date.now() + 1 * 12 * 1000}

		this.timeMarkerInterval = setInterval(this.timeMarkerUpdate, 1000);
	}

	componentWillUnmount()
	{
	}

	componentDidMount()
	{
		this.setState({tasks: [{length:2}, {length:1}, {length:6}, {length:3}] });
	}

	//called upon rendering task list
	handleListLayout = (e) => {
		this.setState({ listHeight: e.nativeEvent.layout.height });
	}

	timeMarkerUpdate = () => {
		let timeMarkerPos = this.state.listHeight * ((Date.now() - this.timePeriod.start) / (this.timePeriod.end - this.timePeriod.start));
		timeMarkerPos = Math.max(0, Math.min(this.state.listHeight, timeMarkerPos));
		this.setState({ timeMarkerPos: timeMarkerPos });
	}

	taskRender = ({item}) => {
		//get sum of all task lengths
		const total = this.state.tasks.reduce((sum, task) => sum + task.length, 0);

		let taskStyle = styles.task;
		if(this.state.listHeight != 0)
			taskStyle = {...taskStyle, height: (item.length / total) * this.state.listHeight };

		return (
			<View style = {taskStyle}>
				<Text>{`${item.length}`}</Text>
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
		content: (actions) => { return this.darkBackground(<Text style={{color:"red"}}>default</Text>) },
		onComplete: (result) => { this.setState({ modalStack: this.state.modalStack.dropLast() }) },
		onCancel: () => { this.setState({ modalStack: this.state.modalStack.dropLast() }) },
		listener: null
	};
	
	newTaskModal = new Modal({
		content: (actions) => {
			const [startTime, setStartTime] = React.useState();
			const [endTime, setEndTime] = React.useState();
			return ( this.darkBackground(
				<View style={{width:250, height:200, padding:32, backgroundColor:"white", borderRadius:20, gap:16}}>
					<TouchableOpacity style={{flexDirection:"row"}} onPress={ ()=>{
							this.setState({modalStack: this.state.modalStack.push({ ...this.timePickerModal, listener: setStartTime })}) } }>
						<Text>Start time: </Text>
						<View style={{borderWidth:1, borderColor:"black"}}><Text>{!startTime ? "--:--" : `${startTime.hour}:${startTime.minute} ${startTime.ampm}`}</Text></View>
					</TouchableOpacity>
					<TouchableOpacity style={{flexDirection:"row"}} onPress={ ()=>{
							this.setState({modalStack: this.state.modalStack.push({ ...this.timePickerModal, listener: setEndTime })}) } }>
						<Text>End time: </Text>
						<View style={{borderWidth:1, borderColor:"black"}}><Text>{!endTime ? "--:--" : `${endTime.hour}:${endTime.minute} ${endTime.ampm}`}</Text></View>
					</TouchableOpacity>
				</View>
			) )
		}
	}, this.defaultModal);

	formatStateNumber = (value, setter, min, max, pad = false) => {
		let num = parseInt(value);
		if(isNaN(value) || value < min)
			num = min;
		else if(num > max)
			num = max;
		const result = !pad ? String(num) : String(num).padStart(2, '0');
		setter(result);
		return result;
	};

	//modal for picking a time of the day
	timePickerModal = new Modal({
		content: (actions) => {
			const [hour, setHour] = React.useState("12");
			const [minute, setMinute] = React.useState("00");
			const [ampm, setAmpm] = React.useState("AM");
			const hourBlur = () => { return this.formatStateNumber(hour, setHour, 1, 12) };
			const minuteBlur = () => { return this.formatStateNumber(minute, setMinute, 0, 59, true) };
			const ampmBlur = () => {
				const result = ampm.toLowerCase() == "pm" ? "PM" : "AM";
				setAmpm(result);
				return result;
			};
			return (
				<View style={{top:-200, backgroundColor:"white", borderRadius:10, padding:10, gap:10}}>
					<View style={{flexDirection:"row"}}>
						<TextInput style={{width:40}} value={hour} onBlur={hourBlur} maxLength={2} keyboardType="numeric" onChangeText={setHour}/>
						<Text>:</Text>
						<TextInput style={{width:40}} value={minute} onBlur={minuteBlur} maxLength={2} keyboardType="numeric" onChangeText={setMinute}/>
						<Text> </Text>
						<TextInput style={{width:40}} value={ampm} onBlur={ampmBlur} maxLength={2} onChangeText={setAmpm}/>
					</View>
					<CoolFreakingButton title="submit" style={{backgroundColor:"skyblue", borderRadius:10}} onPress={ () => {
						actions.complete({hour: hourBlur(), minute: minuteBlur(), ampm: ampmBlur()})
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
