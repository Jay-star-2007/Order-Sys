<template>
  <view class="pay-result">
    <!-- 支付结果动画区域 -->
    <view class="result-animation">
      <view :class="['circle', payStatus ? 'success' : 'fail']">
        <view class="icon">
          <text v-if="payStatus" class="success-icon">✓</text>
          <text v-else class="fail-icon">✕</text>
        </view>
      </view>
    </view>

    <!-- 结果提示文本 -->
    <view class="result-text">
      <text class="status">{{ payStatus ? '支付成功' : '支付失败' }}</text>
      <text class="amount">￥{{ amount }}</text>
      <text class="tips">{{ payStatus ? '感谢您的惠顾' : '请重新尝试支付' }}</text>
    </view>

    <!-- 订单信息 -->
    <view class="order-info">
      <view class="info-item">
        <text class="label">订单编号</text>
        <text class="value">{{ orderNo }}</text>
      </view>
      <view class="info-item">
        <text class="label">支付时间</text>
        <text class="value">{{ payTime }}</text>
      </view>
    </view>

    <!-- 底部按钮 -->
    <view class="bottom-btns">
      <button class="btn primary" @tap="backToHome">返回首页</button>
      <button v-if="!payStatus" class="btn outline" @tap="retryPay">重新支付</button>
    </view>

    <!-- 推荐菜品 -->
    <view v-if="payStatus" class="recommendations">
      <text class="rec-title">店长推荐</text>
      <scroll-view scroll-x class="rec-list">
        <view v-for="(item, index) in recommendations" :key="index" class="rec-item">
          <image :src="baseUrl + '/image/dish/' + item.image" mode="aspectFill"></image>
          <text class="dish-name">{{ item.name }}</text>
          <text class="dish-price">￥{{ item.price }}</text>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script>
import { getBaseUrl } from "../../utils/requestUtil.js"

export default {
  data() {
    return {
      baseUrl: '',
      payStatus: true, // 支付状态
      amount: '0.00', // 支付金额
      orderNo: '', // 订单编号
      payTime: '', // 支付时间
      recommendations: [
        { name: '红烧肉', price: '38', image: 'dish1.png' },
        { name: '糖醋排骨', price: '42', image: 'dish2.png' },
        { name: '水煮鱼', price: '56', image: 'dish3.png' }
      ]
    }
  },
  onLoad(options) {
    this.baseUrl = getBaseUrl()
    // 获取路由参数
    this.payStatus = options.status === 'success' && options.transac_status === 'success'
    this.amount = options.amount || '0.00'
    this.orderNo = options.orderNo || ''
    this.payTime = this.formatDate(new Date())
  },
  methods: {
    formatDate(date) {
      const year = date.getFullYear()
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const day = date.getDate().toString().padStart(2, '0')
      const hour = date.getHours().toString().padStart(2, '0')
      const minute = date.getMinutes().toString().padStart(2, '0')
      return `${year}-${month}-${day} ${hour}:${minute}`
    },
    backToHome() {
      wx.reLaunch({
        url: '/pages/index/index'
      })
    },
    retryPay() {
      wx.navigateBack()
    }
  }
}
</script>

<style>
.pay-result {
  padding: 40rpx;
  min-height: 100vh;
  background: #fff;
}

/* 结果动画样式 */
.result-animation {
  display: flex;
  justify-content: center;
  margin: 60rpx 0;
}

.circle {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: scaleIn 0.3s ease-out;
}

.circle.success {
  background: linear-gradient(135deg, #52c41a, #85ce61);
}

.circle.fail {
  background: linear-gradient(135deg, #ff4d4f, #ff7875);
}

.icon {
  font-size: 80rpx;
  color: #fff;
}

/* 结果文本样式 */
.result-text {
  text-align: center;
  margin-bottom: 60rpx;
}

.status {
  display: block;
  font-size: 40rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
}

.amount {
  display: block;
  font-size: 60rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.tips {
  font-size: 28rpx;
  color: #999;
}

/* 订单信息样式 */
.order-info {
  background: #f8f8f8;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 60rpx;
}

.info-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.info-item:last-child {
  margin-bottom: 0;
}

.label {
  color: #666;
  font-size: 28rpx;
}

.value {
  color: #333;
  font-size: 28rpx;
}

/* 按钮样式 */
.bottom-btns {
  display: flex;
  justify-content: center;
  gap: 30rpx;
  margin-bottom: 60rpx;
}

.btn {
  flex: 1;
  max-width: 300rpx;
  height: 88rpx;
  line-height: 88rpx;
  border-radius: 44rpx;
  font-size: 32rpx;
  text-align: center;
}

.primary {
  background: linear-gradient(to right, #ff8f8f, #ff7575);
  color: #fff;
  border: none;
}

.outline {
  background: #fff;
  color: #ff7575;
  border: 2rpx solid #ff7575;
}

/* 推荐菜品样式 */
.recommendations {
  margin-top: 60rpx;
}

.rec-title {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 30rpx;
  display: block;
}

.rec-list {
  white-space: nowrap;
}

.rec-item {
  display: inline-block;
  margin-right: 30rpx;
  width: 200rpx;
}

.rec-item image {
  width: 200rpx;
  height: 200rpx;
  border-radius: 16rpx;
}

.dish-name {
  font-size: 28rpx;
  color: #333;
  margin: 10rpx 0;
  display: block;
}

.dish-price {
  font-size: 28rpx;
  color: #ff7575;
  font-weight: bold;
}

/* 动画关键帧 */
@keyframes scaleIn {
  from {
    transform: scale(0);
  }
  to {
    transform: scale(1);
  }
}
</style>
