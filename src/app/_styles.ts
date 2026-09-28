import { StyleSheet } from "react-native";
import { colors } from "@/styles/colors";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.night,
    },

    header: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 20,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },

    headerTitle: {
        color: colors.white,
        fontSize: 20,
        fontWeight: 'bold'
    },

    logo: {
        width: 38,
        height: 32
    },

    card: {
        backgroundColor: colors.card,
        padding: 12,
        borderRadius: 12
    },

    cardTitle: {
        color: colors.white,
        fontSize: 16,
        fontWeight: 'bold'
    },

    categorySelected: {
        backgroundColor: colors.blue[500]
    },

    categoriesRow: {
        flexDirection: 'column',
        gap: 16,
        paddingHorizontal: 16,
        paddingVertical: 12
    },
})