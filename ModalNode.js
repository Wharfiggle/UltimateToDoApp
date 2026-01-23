import { View } from "react-native";

export default function ModalNode({
    style = {position:"absolute", alignItems:"center", justifyContent:"center"},
    node = null
})
{
    if(!node)
        return;
    return (
        <View style={style}>
            { node.value.content(node.value) }
            { (node.next != null) && <ModalNode node={node.next}/> }
        </View>
    );
}