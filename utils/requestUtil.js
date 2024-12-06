// 同时发送异步代码的次数
let ajaxTimes=0;

// 定义公共的url
const baseUrl="http://localhost:80";

/**
 * 返回baseUrl
 */
export const getBaseUrl=()=>{
  return baseUrl;
}

/**
 * 后端请求工具类
 * @param {*} params 请求参数
 */
export const requestUtil=(params)=>{
 
   let header={...params.header};
 
    // 拼接header 带上token
    header["token"]=uni.getStorageSync("token");

    ajaxTimes++;
	
     // 显示加载中 效果
    wx.showLoading({
      title: "加载中",
      mask: true
    });

    var start = new Date().getTime();

    // 模拟网络延迟加载
    while(true)  if(new Date().getTime()-start > 1000*1) break;

  return new Promise((resolve,reject)=>{
    wx.request({
     ...params,
     header:header,
     url:baseUrl+params.url,
     success:(result)=>{
       resolve(result.data);
     },
     fail:(err)=>{
		 uni.showToast({
			icon:'error',
		 	title:'连接服务器失败',
			duration:3000
		 })
       reject(err);
     },
     complete:()=>{
      ajaxTimes--;
      if(ajaxTimes===0){
        //  关闭正在等待的图标
        wx.hideLoading();
      }
     }
    });
  })
}