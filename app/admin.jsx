const saveEditProduct = async () => {
    if (!editForm.name || !editForm.price) { Alert.alert("Error", "Name and price required!"); return; }
    try {
      if (editingProduct.isBuiltIn) {
        const res = await fetch(`https://firestore.googleapis.com/v1/projects/kadai-veedhi/databases/(default)/documents/adminProducts?key=AIzaSyAsJs5DYiCone1Nvo4mDem9mWvt-3ZZZLQ`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fields: {
              name: { stringValue: editForm.name },
              price: { stringValue: editForm.price },
              unit: { stringValue: editForm.unit },
              category: { stringValue: editForm.category },
              emoji: { stringValue: editForm.emoji || "🛒" },
              stock: { integerValue: parseInt(editForm.stock) || 100 },
            }
          }),
        });
        if (res.ok) {
          Alert.alert("Saved!", "Product saved!");
          setShowEditProduct(false);
          setEditingProduct(null);
          fetchAdminProducts();
        } else {
          Alert.alert("Error", "Failed to save!");
        }
      } else {
        const pathParts = editingProduct.path.split("/documents/");
        const docPath = pathParts.length > 1 ? pathParts[1] : editingProduct.path;
        const url = `https://firestore.googleapis.com/v1/projects/kadai-veedhi/databases/(default)/documents/${docPath}?updateMask.fieldPaths=name&updateMask.fieldPaths=price&updateMask.fieldPaths=unit&updateMask.fieldPaths=category&updateMask.fieldPaths=emoji&updateMask.fieldPaths=stock&key=AIzaSyAsJs5DYiCone1Nvo4mDem9mWvt-3ZZZLQ`;
        const res = await fetch(url, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fields: {
              name: { stringValue: editForm.name },
              price: { stringValue: editForm.price },
              unit: { stringValue: editForm.unit },
              category: { stringValue: editForm.category },
              emoji: { stringValue: editForm.emoji || "🛒" },
              stock: { integerValue: parseInt(editForm.stock) || 100 },
            }
          }),
        });
        if (res.ok) {
          Alert.alert("Updated!", "Product updated!");
          setShowEditProduct(false);
          setEditingProduct(null);
          fetchAdminProducts();
        } else {
          const errData = await res.json();
          Alert.alert("Error", errData.error?.message || "Failed!");
        }
      }
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  const deleteProduct = (productPath) => {
    Alert.alert("Delete", "Are you sure?", [
      { text: "Cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
        await fetch(`https://firestore.googleapis.com/v1/${productPath}?key=AIzaSyAsJs5DYiCone1Nvo4mDem9mWvt-3ZZZLQ`, { method: "DELETE" });
        Alert.alert("Deleted!", "Product removed!");
        fetchAdminProducts();
      }},
    ]);
  };
