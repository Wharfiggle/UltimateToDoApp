import { View, StyleSheet } from "react-native";

const style = {top:0, bottom:0, left:0, right:0,
    position:"absolute", alignItems:"center", justifyContent:"center"};

const complete = (result, node) => {
    node.value.onComplete?.(result);
    node.value.listener?.(result);
}
const cancel = (node) => {
    node.value.onCancel?.();
}

export default function ModalNode({
    node = null
})
{
    if(!node)
        return;

    const actionComplete = (result) => { complete(result, node) };
    const actionCancel = () => { cancel(node) };

    return (
        <View style={style}>
            <View style={{...StyleSheet.absoluteFillObject, position:"absolute", opacity:0, backgroundColor:"red"}}/>
            { node.value.content({ complete: actionComplete, cancel: actionCancel }, node.value.inputs) }
            { (node.next != null) && <ModalNode node={node.next}/> }
        </View>
    );
}