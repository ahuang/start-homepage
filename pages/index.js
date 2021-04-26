import styles from './index.css';
import news from './data/1news.json';
import search from './data/2search.json';
import tools from './data/3tools.json';
import study from './data/4.1.study.json';
import eduction from './data/4.2.eduction.json';
import story from './data/4.3.story.json';
import life from './data/5life.json';
import fun from './data/6fun.json';
import vue from './data/7vue.json';
import react from './data/8react.json';
import wechat from './data/9wechat.json';
import alipay from './data/10alipay.json';

export default function() {
  const renderContent = () =>{
    const data = [news,search, tools, study, eduction, story,life,fun,vue,react,wechat, alipay];
    const blocks = data.map(d =>{
      const list = d.list.map((m,i) =>{
        if(m.icon){
          return(
            <a href={m.url} target="_blank" key={i} 
              className={styles.url + ` ${m.highlight ? styles.highlight: ''}`} title={m.name}>
              <img src={`./icons/${m.icon}`}  key={i} width="20"/>
            </a>)
        }else{
          return (
          <a href={m.url + ` ${m.highlight ? styles.highlight: ''}`} target="_blank" key={i} className={styles.url}>
            {m.name}
          </a>)
        }
      });
      return (<div className={styles.blocks}  key={d.key}>
        <span className={styles.title}>
          {d.title}
        </span>
        <>{list}</>
      </div>)
    });
    return blocks;
  }

  const renderWechat = () =>{
    return (
      <div>
          <img src='./wechat/public.jpg'  width="40%" style={{margin: '5%'}}/>
          <img src='./wechat/miniapp.jpg'  width="40%" style={{margin: '5%'}}/>
        </div>
    )
  }
  return (
    <div>
      <h3 className={styles.remember}>
        <p className={styles.fmgr16}>keep straight!</p>
        <p className={styles.fmgr16}>keep thinking!</p>
        <p className={styles.fmgr16}>no complain!</p>
      </h3>
      <div className={styles.wrap}>
        {renderContent()}
        {renderWechat()}
      </div>
    </div>
  );
}
