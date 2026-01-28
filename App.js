import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, FlatList, View, TouchableOpacity, TextInput } from "react-native";
import CoolFreakingButton from "./CoolFreakingButton.js";
import ModalNode from "./ModalNode.js";
import React from "react";
import LinkedList from "./LinkedList.js";
import { Hour, Minute, Ampm, Time, TimeFromSecs, TimePeriod, SecsSinceMidnight } from "./TimeStructs.js";
import { newTask, timePicker, Modal, defaultModal, darkBackground } from "./ModalStructs.js";


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

	newTaskModal = newTask(this.setState.bind(this), () => this.state);
	timePickerModal = timePicker(this.setState.bind(this), () => this.state);

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
