import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, FlatList, View } from "react-native";
import React from "react";

export default class App extends React.Component
{
	constructor(props)
	{
		super(props);

		this.state = {
			tasks: []
		}
	}

	componentWillUnmount()
	{
	}

	componentDidMount()
	{
		this.setState({tasks: [{length:2}, {length:1}, {length:6}] });
	}

	taskRender = ({item}) => {
		return (<View style={[styles.task, {height:`${(item.length / 12) * 100}%`}]}>
			<Text>{`${item.length}`}</Text>
		</View>)
	}

	render()
	{
		return (<View style={styles.container}><View style={styles.subcontainer}>
			<StatusBar></StatusBar>
			<Text>Hi</Text>
			<View style={{backgroundColor:"red", flex:1}}><FlatList
				data={this.state.tasks}
				renderItem={this.taskRender}
				keyExtractor={(item, index) => index}
			/></View></View>
		</View>);
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
		borderWidth:2,
		borderColor:"black",
		backgroundColor:"green"
	}
});
