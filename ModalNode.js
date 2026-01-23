import { View, Text } from "react-native";

export default function ModalNode({
    style = {position:"absolute", alignItems:"center", justifyContent:"center"},
    content = () => {},
    onComplete = () => {},
    onCancel = () => {},
    next = null
})
{
    return (
        <View style={style}>
            { content({onComplete: onComplete}) }
            { (next != null) && <ModalNode content={next.content} onComplete={next.onComplete}></ModalNode> }
        </View>
    );
}