<template>
  <view class="details-view">
    <view class="order-top">
      <view class="order-remind">
        <view>坐等开吃~</view>
        <view>后厨铲子都要抡冒烟啦！</view>
      </view>
    </view>
    <view class="food-list">
      <view class="foot-back">
        <view class="foot-til">
          <text>我的订单</text>
        </view>
        <block v-for="(item, index) in goods_data" :key="index">
          <view class="foot-deta">
            <view>
              <image :src="baseUrl + '/image/dish/' + item.image" mode="aspectFill"></image>
            </view>
            <view class="foot-name">
              <text>{{ item.name }}</text>
              <text>{{ item.quantity }}{{ item.unit }}</text>
            </view>
            <view class="foot-total">¥{{ item.total_price }}</view>
          </view>
        </block>
        <!-- 总计 -->
        <view class="total-view">
          <view>共 {{ overall }} 份</view>
          <view class="total-price">
            <text>总计</text>
            <text>¥{{ Price(Number(other_data.sett_amount)) }}</text>
          </view>
        </view>
      </view>
      <!-- 订单号 -->
      <view class="foot-back order-number">
        <text>订单编号：{{ other_data.order_no }}</text>
        <text>下单时间：{{ other_data.order_time }}</text>
        <text>桌台名称：{{ other_data.table_number }}</text>
      </view>
      <view style="height: 300rpx;"></view>
    </view>

    <!-- 底部操作栏 -->
    <view class="bottom-bar" :style="{'padding-bottom': Modelmes ? '68rpx' : ''}">
      <view class="bottom-btn add-dish" @tap="add_Dish">
        <text>加菜</text>
      </view>
      <view class="bottom-btn pay-btn" @tap="handlePayment">
        <text>结账</text>
      </view>
    </view>
  </view>
</template>

<script>
import { getBaseUrl, requestUtil } from "../../utils/requestUtil.js";
const app = getApp();
const { Modelmes } = app.globalData;
// 骨架屏
import Order from "../skeleton-view/order.vue";
const db = wx.cloud.database();
const _ = db.command;
const good_collect = db.collection("order-data");
// 价格补零
const Price = require("e-commerce_price");

export default {
  components: { Order },
  data() {
    return {
      baseUrl: "",
      exist: true,
      Modelmes,
      Price,
      overall: 0, // 总的多少份
      other_data: {},
      comp_data: [], // 完整数据
      goods_data: [], // 菜品数据
    };
  },
  methods: {
    async get_menu() {
      try {
        // 取出本地缓存的桌号和用餐人数
        let table_number = wx.getStorageSync('table_num')
        const res = await requestUtil({
          url: "/order/get",
          data: { table_number: table_number, transac_status: "unsettled" },
          method: "get",
        });
        console.log(res);

        let res_data = res.goods_list;
        // 获取本地存储的加菜数据
        let additionalGoods = wx.getStorageSync('additional_goods') || []
        
        // 合并原有菜品和加菜数据
        this.goods_data = res_data
        
        // 重新计算总价和数量
        let totalAmount = 0
        this.goods_data.forEach(item => {
          totalAmount += item.total_price
        })
        this.overall = this.goods_data.length
        
        // 更新订单信息
        this.other_data = {
          ...res.menu,
          sett_amount: totalAmount
        }

        this.exist = false
      } catch (e) {
        console.error(e)
      }
    },
    // 加菜
    add_Dish() {
      wx.navigateTo({
        url: `/pages/home-page/page?orderNo=${this.other_data.order_no}&isAdditional=true`
      })
    },
    // 在页面卸载时清理本地存储的加菜数据
    onUnload() {
      wx.removeStorageSync('additional_goods')
    },
    // 处理支付逻辑
    async handlePayment() {
      if(this.other_data.transac_status === 'settled') {
        wx.showToast({
          title: '订单已支付',
          icon: 'none'
        })
        return
      }

      wx.showLoading({
        title: '支付处理中...',
        mask: true
      })

      try {
        const res = await requestUtil({
          url: "/order/pay",
          method: "POST",
          data: {
            orderNo: this.other_data.order_no
          }
        })
        
        wx.hideLoading()

        if(res.code === 0) {
          // 跳转到支付结果页面,设置状态为success
          wx.redirectTo({
            url: `/pages/pay-page/pay?status=success&amount=${this.other_data.sett_amount}&orderNo=${this.other_data.order_no}&transac_status=success`
          })
        } else {
          // 支付失败时跳转,设置状态为unsettled
          wx.redirectTo({
            url: `/pages/pay-page/pay?status=fail&amount=${this.other_data.sett_amount}&orderNo=${this.other_data.order_no}&transac_status=unsettled`
          })
        }
      } catch (error) {
        console.error('支付失败:', error)
        wx.hideLoading()
        // 发生错误时跳转,设置状态为unsettled
        wx.redirectTo({
          url: `/pages/pay-page/pay?status=fail&amount=${this.other_data.sett_amount}&orderNo=${this.other_data.order_no}&transac_status=unsettled`
        })
      }
    }
  },
  onLoad() {
    this.get_menu();
    this.baseUrl = getBaseUrl();
  },
};
</script>

<style scoped>
page {
  background-color: #f4f4f4;
}
.details-view {
  position: relative;
}
.order-top {
  background: linear-gradient(to bottom, #ff8f8f, #ffbdbd, #ffbdbd, #fdd2d2, #ff8f8f);
  height: 300rpx;
}
.order-remind view:nth-child(1) {
  font-size: 35rpx;
  font-weight: bold;
  padding-bottom: 20rpx;
}
.order-remind {
  height: 200rpx;
  padding: 50rpx 0 0 50rpx;
}
.food-list {
  position: absolute;
  top: 200rpx;
  left: 20rpx;
  right: 20rpx;
}
.foot-back {
  background-color: #fefefe;
  border-radius: 10rpx;
  padding: 0 20rpx;
  margin-bottom: 30rpx;
}
.foot-til {
  height: 100rpx;
  color: #999999;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.foot-deta image {
  display: block;
  width: 130rpx;
  height: 130rpx;
  border-radius: 10rpx;
}
.foot-deta {
  display: flex;
  justify-content: space-between;
  height: 130rpx;
  margin: 40rpx 0;
}
.foot-name {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 0 20rpx;
  font-size: 30rpx;
}
.foot-name text:nth-child(1) {
  font-size: 31rpx !important;
  font-weight: bold;
}
.foot-name text:nth-child(2) {
  color: #666666;
}
.foot-total {
  font-weight: bold;
}
/* 展开更多 */
.expand-more image {
  width: 25rpx;
  height: 25rpx;
  display: block;
  padding-left: 10rpx;
}
.expand-more {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999999;
  font-size: 25rpx;
  padding: 30rpx 0;
  border-bottom: 1rpx solid #f1f1f2;
}
/* 总计 */
.total-price {
  display: flex;
  align-items: center;
  color: #333333;
  padding-left: 40rpx;
}
.total-price text:nth-child(2) {
  font-size: 35rpx;
  font-weight: bold;
  padding-left: 30rpx;
}
.total-view {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 30rpx 0;
}
.total-view view:nth-child(1) {
  color: #999999;
}
/* 订单号 */
.order-number text {
  display: block;
  padding: 15rpx 0;
  font-size: 28rpx;
  color: #999999;
}
/* 底部操作栏 */
.bottom-bar {
  background-color: #fdd2d2;
  height: 120rpx;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  box-shadow: 0rpx -1.9rpx 1rpx 1rpx #ffbdbd;
  padding: 0 20rpx;
  z-index: 9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.bottom-btn {
  width: 45%;
  height: 75rpx;
  line-height: 75rpx;
  text-align: center;
  border-radius: 50rpx;
  font-weight: bold;
}
.bottom-btn text {
  display: inline-block;
  width: 100%;
  height: 100%;
}
.add-dish {
  background: linear-gradient(to right, #fdd2d2, #ff8f8f, #ffbdbd, #ffd5cf);
}
.pay-btn {
  background: linear-gradient(to right, #ff8f8f, #ff7575);
  color: #fff;
}
</style>
