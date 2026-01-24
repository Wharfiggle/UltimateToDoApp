import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, FlatList, View, Button, TextInput } from "react-native";
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

		setTimeout(resolve => {
			this.setState({ modalStack: this.state.modalStack.push(this.testModal) });
		}, 1000);
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


	//Modal Node stuff

	defaultModal = {
		content: (actions) => {},
		onComplete: (result) => { this.setState({ modalStack: this.state.modalStack.dropLast() }) },
		onCancel: () => { this.setState({ modalStack: this.state.modalStack.dropLast() }) },
		listener: null
	};
	
	testModal = new Modal({
		content: (actions) => {
			const [value, setValue] = React.useState(null);
			return (
				<Text onPress={()=>{
					let modal = this.testModal2;
					modal.listener = setValue;
					this.setState({modalStack: this.state.modalStack.push(modal)})
				}}>{!value ? "nothing" : value}</Text>
			)
		}
	}, this.defaultModal);

	testModal2 = new Modal({
		content: (actions) => {
			const [value, setValue] = React.useState(null);
			return (
				<View style={{top:-100}}>
					<TextInput placeholder="type..." onChangeText={setValue}/>
					<Button title="submit" onPress={()=>{actions.complete(value)}}/>
				</View>
			)
		},
		onComplete: (result) => {
			console.log("booga: " + result);
			this.defaultModal.onComplete(result);
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
