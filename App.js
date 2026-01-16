import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, FlatList, View } from "react-native";
import React from "react";

export default class App extends React.Component
{
	constructor(props)
	{
		super(props);

		this.state = {
			tasks: [],
			listHeight: 0
		}
	}

	componentWillUnmount()
	{
	}

	componentDidMount()
	{
		this.setState({tasks: [{length:2}, {length:1}, {length:6}] });
	}

	//called upon rendering task list
	handleListLayout = (e) => {
		this.setState({ listHeight: e.nativeEvent.layout.height });
	}

	taskRender = ({item}) => {
		//get sum of all task lengths
		const total = this.state.tasks.reduce((sum, task) => sum + task.length, 0);

		var heightStyle = { flex: item.length };
		if(this.state.listHeight != 0)
			heightStyle = { height: (item.length / total) * this.state.listHeight };

		return (
			<View style={[styles.task, heightStyle]}>
				<Text>{`${item.length}`}</Text>
			</View>
		)
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
							ItemSeparatorComponent={(<View style={{height:2, backgroundColor:"black"}}></View>)}
						/>
					</View>
				</View>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container:{
		flex:1,
		justifyContent:"center",
		alignItems:"center"
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
		borderColor:"black",
		backgroundColor:"green",
		justifyContent:"center",
		alignItems:"center"
	}
});
