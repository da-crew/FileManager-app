// ... existing code ...

// แก้ไขพื้นหลังจากสีเทาเป็นสีขาว ที่บรรทัดประมาณ 65 (ที่มี backgroundColor)
<View style={{
    width: itemWidth,
    height: itemWidth,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: selectionSet.has(item) ? 3 : 0,
    borderColor: '#2196F3',
}}>
    <Image 
        source={{ uri: `file://${item.path}` }}
        style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
    />
</View>

// ... existing code ...
