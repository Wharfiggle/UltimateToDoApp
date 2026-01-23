import { Pressable, StyleSheet, View, Text } from "react-native";
import { MaterialCommunityIcons as Icon, FontAwesome as IconAwesome } from "@expo/vector-icons";

//custom button with automatic disable styling
export default function CoolFreakingButton({
    title = "",
    icon = "",
    iconAwesome = "",
    onPress,
    style,
    pressedColor="rgba(0,0,0,0.4)",
    contentStyle,
    iconStyle,
    disabled,
    disabledStyle,
    disabledContentStyle,
    disabledIconStyle
})
{
    style = { backgroundColor:"#1DB954", justifyContent:"center", alignItems:"center", padding:5, borderRadius:3, ...style };
    contentStyle = { includeFontPadding: false, color:"white", fontFamily:"InterMedium", fontWeight:"500", fontSize:16, ...contentStyle };
    disabledStyle = { ...style, backgroundColor:"#3B3B3B", ...disabledStyle };
    disabledIconStyle = { ...contentStyle, ...iconStyle, color:"#999999", ...disabledContentStyle, ...disabledIconStyle }
    disabledContentStyle = { ...contentStyle, color:"#999999", ...disabledContentStyle };
    var finalContentStyle = [ contentStyle, disabled && disabledContentStyle ];
    var finalIconStyle = [ contentStyle, iconStyle, disabled && disabledIconStyle ];

    return (
        <Pressable
            onPress={onPress}
            disabled={disabled}
        >
        { ({ pressed }) => (
            <View style={[ {overflow:"hidden", flexDirection:"row"}, style, disabled && disabledStyle ]}>
                { icon != "" && <Icon name={icon} style={finalIconStyle}/> }
                { iconAwesome != "" && <IconAwesome name={iconAwesome} style={finalIconStyle}/> }
                { title != "" && <Text style={finalContentStyle}>{title}</Text> }
                { pressed && <View style={{
                    ...StyleSheet.absoluteFillObject,
                    backgroundColor: pressedColor
                }}/> }
            </View>
        ) }
        </Pressable>
    );
}