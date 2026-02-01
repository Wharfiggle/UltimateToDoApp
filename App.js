import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, FlatList, View } from "react-native";
import CoolFreakingButton from "./CoolFreakingButton.js";
import ModalNode from "./ModalNode.js";
import React from "react";
import LinkedList from "./LinkedList.js";
import { Hour, Minute, Ampm, Time, TimeFromSecs, TimePeriod, SecsSinceMidnight } from "./TimeStructs.js";
import * as ModalStructs from "./ModalStructs.js";


export default class App extends React.Component
{
	constructor(props)
	{
		super(props);

		this.state = {
			tasks: [],
			listHeight: 0,
			timeMarkerPos: 0,
			modalStack: new LinkedList(), //linked list of Modals for use in ModalNode
			listPeriod: new TimePeriod(TimeFromSecs(0), new Time(11, 59, "PM"))
		}

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
		let timeMarkerPos = this.state.listHeight * (SecsSinceMidnight() - this.state.listPeriod.start) / this.state.listPeriod;
		timeMarkerPos = Math.max(0, Math.min(this.state.listHeight, timeMarkerPos));
		this.setState({ timeMarkerPos: timeMarkerPos });
	}

	taskRender = (item, index) => {
		let taskStyle = (this.state.listHeight == 0) ? styles.task : { ...styles.task, 
			height: (item.length / this.state.listPeriod.length) * this.state.listHeight,
			top: (item.start - this.state.listPeriod.start) * (this.state.listHeight / this.state.listPeriod)
		};

		return (
			<View style={taskStyle} key={index}>
				<Text>{String(item)}</Text>
			</View>
		)
	}

	newTaskModal = ModalStructs.newTaskModal(this.setState.bind(this), () => this.state);
	timePickerModal = ModalStructs.timePickerModal(this.setState.bind(this), () => this.state);

	render()
	{
		return (
			<View style={styles.container}>
				<View style={styles.subcontainer}>
					<StatusBar/>
					<View style={{flex:1, borderWidth:1, width:"100%", borderColor:"white"}} onLayout={this.handleListLayout}>
						{ this.state.tasks.map( (item, index) => (this.taskRender(item, index)) ) }
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
		position: "absolute",
		width: "100%",
		backgroundColor:"white",
		justifyContent:"center",
		alignItems:"center"
	}
});
