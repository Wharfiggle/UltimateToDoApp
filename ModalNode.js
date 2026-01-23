import { View } from "react-native";

const defaultStyle = {position:"absolute", alignItems:"center", justifyContent:"center"};

const complete = (result, node) => {
    node.value.onComplete?.(result);
    node.value.listener?.(result);
}
const cancel = (node) => {
    node.value.cancel?.();
}

export default function ModalNode({
    style = defaultStyle,
    node = null,
    listener = null
})
{
    if(!node)
        return;

    const actionComplete = (result) => { complete(result, node) };
    const actionCancel = () => { cancel(node) };

    return (
        <View style={style}>
            { node.value.content({ complete: actionComplete, cancel: actionCancel }) }
            { (node.next != null) && <ModalNode node={node.next}/> }
        </View>
    );
}