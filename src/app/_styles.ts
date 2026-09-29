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

    // Estados visuais usados pela lista durante carregamento e quando vazia.
    listContent: {
        gap: 12,
        padding: 16,
    },

    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },

    loadingText: {
        color: colors.gray[300],
    },

    emptyText: {
        color: colors.gray[300],
        textAlign: 'center',
        paddingVertical: 24,
    },

    modalOverlay: {
        flex: 1,
        alignItems: 'flex-end',
        paddingHorizontal: 20,
    },

    menuBox: {
        width: 180,
        backgroundColor: colors.white,
        borderRadius: 8,
        paddingVertical: 6,
        elevation: 5,
        shadowColor: colors.black,
        shadowOpacity: 0.2,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
    },

    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
    },

    menuText: {
        color: colors.gray[800],
        fontSize: 15,
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