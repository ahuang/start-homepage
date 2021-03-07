import styles from './index.css';
import news from './data/news.json';
import search from './data/search.json';
import tools from './data/tools.json';
import study from './data/study.json';
import life from './data/life.json';
import fun from './data/fun.json';
import vue from './data/fun.json';
import react from './data/react.json';
import wechat from './data/wechat.json';
import alipay from './data/alipay.json';

export default function() {
  const renderContent = () =>{
    const data = [news,search, tools, study,life,fun,vue,react,wechat, alipay];
    const blocks = data.map(d =>{
      const list = d.list.map((m,i) =>{
        if(m.icon){
          return(
            <a href={m.url} target="_blank" key={i} 
              className={styles.url} title={m.name}>
              <img src={`./icons/${m.icon}`}  key={i} width="20"/>
            </a>)
        }else{
          return (
          <a href={m.url} target="_blank" key={i} className={styles.url}>
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
  return (
    <div className={styles.wrap}>
      {renderContent()}
    </div>
  );
}
