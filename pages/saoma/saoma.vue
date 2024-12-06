<template>
  <view class="saoma-container">
    <view class="mock-scan">
      <view class="mock-header">模拟扫码</view>
      
      <!-- 模拟桌号输入 -->
      <view class="mock-input">
        <input type="number" 
               v-model="tableNumber" 
               placeholder="请输入桌号(1-20)"/>
      </view>
      
      <!-- 确认按钮 -->
      <view class="mock-button" @tap="confirmTable">
        确认进入点餐
      </view>
      
      <!-- 快捷桌号选择 -->
      <view class="quick-select">
        <view class="quick-title">快捷选择:</view>
        <view class="table-grid">
          <view v-for="num in 20" 
                :key="num" 
                class="table-item"
                @tap="quickSelect(num)">
            {{num}}号桌
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      tableNumber: ''
    }
  },
  methods: {
    // 快捷选择桌号
    quickSelect(num) {
      this.tableNumber = num
    },
    
    // 确认桌号
    confirmTable() {
      if(!this.tableNumber || this.tableNumber < 1 || this.tableNumber > 20) {
        uni.showToast({
          title: '请输入1-20的桌号',
          icon: 'none'
        })
        return
      }
      
      // 跳转到点餐页面
      uni.redirectTo({
        url: `/pages/index/index?number=${this.tableNumber}`
      })
    }
  }
}
</script>

<style>
.saoma-container {
  padding: 30rpx;
}
.mock-scan {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.1);
}
.mock-header {
  font-size: 36rpx;
  text-align: center;
  margin-bottom: 40rpx;
  color: #333;
}
.mock-input {
  margin: 20rpx 0;
}
.mock-input input {
  border: 2rpx solid #ddd;
  height: 80rpx;
  padding: 0 20rpx;
  border-radius: 10rpx;
}
.mock-button {
  background: #ff7575;
  color: #fff;
  text-align: center;
  padding: 20rpx 0;
  border-radius: 10rpx;
  margin: 40rpx 0;
}
.quick-select {
  margin-top: 40rpx;
}
.quick-title {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 20rpx;
}
.table-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}
.table-item {
  width: calc(25% - 15rpx);
  height: 80rpx;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10rpx;
  font-size: 26rpx;
}
</style>
