import { useRouter } from "expo-router";
import { collection, getDocs } from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { db } from "./firebaseConfig";

export default function Index() {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const userData = querySnapshot.docs.map((doc) => doc.data());
        setData(userData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handlePress = useCallback(() => {
    router.push("/(tabs)");
  }, [router]);

  return (
    <SafeAreaView>
      <ScrollView>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerText}>Welcome to React Native</Text>
          </View>
          <View style={styles.content}>
            <FlatList
              data={data}
              keyExtractor={(item) => item.id}
              renderItem={(item) => (
                <TouchableOpacity style={styles.item} onPress={handlePress}>
                  <View style={styles.itemContent}>
                    <Text style={styles.itemText}>{item.name}</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.searchBar}
              onPress={() => router.push("/search")}
            >
              <Text style={styles.searchText}>🔍 Search for groceries...</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: "center",
    justifyContent: "center",
    height: 60,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
  },
  item: {
    padding: 20,
    marginVertical: 5,
    backgroundColor: "#f5f5f5",
  },
  itemContent: {
    alignItems: "center",
  },
  itemText: {
    fontSize: 18,
  },
  searchBar: {
    padding: 10,
    marginVertical: 10,
    backgroundColor: "#f5f5f5",
  },
  searchText: {
    fontSize: 18,
  },
});
