import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, FlatList, View, Button } from "react-native";
import CoolFreakingButton from "./CoolFreakingButton.js";
import ModalNode from "./ModalNode.js";
import React from "react";

export default class App extends React.Component
{
	constructor(props)
	{
		super(props);

		this.state = {
			tasks: [],
			listHeight: 0,
			timeMarkerPos: 0,
			modal: null
		}

		this.timePeriod = {start: Date.now(), end: Date.now() + 1 * 12 * 1000}

		this.timeMarkerInterval = setInterval(this.timeMarkerUpdate, 1000);

		setTimeout(resolve => {
			var modal = this.testModal;
			this.setState({ modal: modal });
		}, 1000);

		setTimeout(reaolve => {
			var modal = this.state.modal;
			modal.next = this.testModal2;
			this.setState({modal: modal})
		}, 2000)
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
		var timeMarkerPos = this.state.listHeight * ((Date.now() - this.timePeriod.start) / (this.timePeriod.end - this.timePeriod.start));
		timeMarkerPos = Math.max(0, Math.min(this.state.listHeight, timeMarkerPos));
		this.setState({ timeMarkerPos: timeMarkerPos });
	}

	taskRender = ({item}) => {
		//get sum of all task lengths
		const total = this.state.tasks.reduce((sum, task) => sum + task.length, 0);

		var taskStyle = styles.task;
		if(this.state.listHeight != 0)
			taskStyle = {...taskStyle, height: (item.length / total) * this.state.listHeight };

		return (
			<View style = {taskStyle}>
				<Text>{`${item.length}`}</Text>
			</View>
		)
	}


	testModal = {
		content: (args) => { return ( <Button title="foo" onPress={args.onComplete}></Button> ) },
		onComplete: (args) => { this.setState({ modal: null }) },
		next: this.testModal2
	}
	testModal2 = {
		content: (args) => { return ( <View style={{top:100}}><Button title="bar" onPress={args.onComplete}></Button></View> ) },
		onComplete: (args) => { 
			var modal = this.state.modal;
			modal.next = null;
			this.setState({ modal: modal })
		}
	}

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
				{(this.state.modal != null) && <ModalNode
					content = {this.state.modal.content}
					onComplete = {this.state.modal.onComplete}
					next = {this.state.modal.next}
				></ModalNode>}
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
