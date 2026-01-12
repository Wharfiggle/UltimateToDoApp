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

	handleListLayout = (e) => {
		this.setState({ listHeight: e.nativeEvent.layout.height });
	}

	taskRender = ({item}) => {
		const total = this.state.tasks.reduce((s,t) => s + (t.length || 0), 0) || 1;
		// If we have measured the list height, compute pixel height; otherwise fall back to flex
		const height = this.state.listHeight ? (item.length / total) * this.state.listHeight : undefined;
		const itemStyle = height ? { height } : { flex: item.length };

		return (
			<View style={[styles.task, itemStyle]}>
				<Text>{`${item.length}`}</Text>
			</View>
		)
	}

	render()
	{
		return (
			<View style={styles.container}>
				<View style={styles.subcontainer}>
					<StatusBar />
					<Text>Hi</Text>
					<View
						style={{backgroundColor:"red", flex:1}}
						onLayout={this.handleListLayout}
					>
						<FlatList
							data={this.state.tasks}
							renderItem={this.taskRender}
							keyExtractor={(item, index) => index.toString()}
							style={{flex:1}}
							contentContainerStyle={{flexGrow:1}}
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
		borderWidth:2,
		borderColor:"black",
		backgroundColor:"green",
		justifyContent:"center",
		alignItems:"center"
	}
});
