-- 笔记模板系统数据库结构
-- 请在Supabase SQL编辑器中运行以下SQL

-- 1. 创建模板表
CREATE TABLE note_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  category VARCHAR(50) DEFAULT 'custom',
  icon VARCHAR(10) DEFAULT '📝',
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_public BOOLEAN DEFAULT false,
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 启用行级安全策略
ALTER TABLE note_templates ENABLE ROW LEVEL SECURITY;

-- 3. 创建策略：用户可以访问自己的模板和公共模板
CREATE POLICY "Users can view own and public templates" ON note_templates
  FOR SELECT USING (
    auth.uid() = user_id OR 
    is_public = true OR 
    is_system = true
  );

CREATE POLICY "Users can insert own templates" ON note_templates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own templates" ON note_templates
  FOR UPDATE USING (auth.uid() = user_id AND is_system = false);

CREATE POLICY "Users can delete own templates" ON note_templates
  FOR DELETE USING (auth.uid() = user_id AND is_system = false);

-- 4. 创建更新时间触发器
CREATE TRIGGER update_note_templates_updated_at 
    BEFORE UPDATE ON note_templates 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 5. 插入系统预设模板
INSERT INTO note_templates (name, description, content, category, icon, is_system, is_public) VALUES
('学习笔记', '用于记录学习内容和要点', '<h1>📚 学习笔记</h1>
<h2>📖 主题</h2>
<p></p>

<h2>🎯 学习目标</h2>
<ul>
  <li></li>
  <li></li>
</ul>

<h2>📝 核心内容</h2>
<h3>重点概念</h3>
<p></p>

<h3>关键信息</h3>
<p></p>

<h2>💡 个人理解</h2>
<p></p>

<h2>❓ 疑问和思考</h2>
<ul>
  <li></li>
</ul>

<h2>📋 总结</h2>
<p></p>

<h2>🔗 参考资料</h2>
<ul>
  <li></li>
</ul>', 'study', '📚', true, true),

('会议记录', '用于记录会议内容和行动项', '<h1>📅 会议记录</h1>
<p><strong>日期：</strong> </p>
<p><strong>时间：</strong> </p>
<p><strong>地点：</strong> </p>
<p><strong>主持人：</strong> </p>

<h2>👥 参会人员</h2>
<ul>
  <li></li>
  <li></li>
</ul>

<h2>📋 会议议程</h2>
<ol>
  <li></li>
  <li></li>
</ol>

<h2>💬 讨论内容</h2>
<h3>议题1：</h3>
<p></p>

<h3>议题2：</h3>
<p></p>

<h2>✅ 决议事项</h2>
<ul>
  <li></li>
  <li></li>
</ul>

<h2>🎯 行动项</h2>
<table>
  <tr>
    <th>任务</th>
    <th>负责人</th>
    <th>截止时间</th>
  </tr>
  <tr>
    <td></td>
    <td></td>
    <td></td>
  </tr>
</table>

<h2>📝 备注</h2>
<p></p>', 'work', '📅', true, true),

('项目规划', '用于项目计划和管理', '<h1>🚀 项目规划</h1>
<p><strong>项目名称：</strong> </p>
<p><strong>开始日期：</strong> </p>
<p><strong>预计完成：</strong> </p>
<p><strong>项目负责人：</strong> </p>

<h2>🎯 项目目标</h2>
<p></p>

<h2>📊 项目范围</h2>
<h3>包含内容</h3>
<ul>
  <li></li>
  <li></li>
</ul>

<h3>不包含内容</h3>
<ul>
  <li></li>
</ul>

<h2>📅 时间安排</h2>
<table>
  <tr>
    <th>阶段</th>
    <th>开始时间</th>
    <th>结束时间</th>
    <th>里程碑</th>
  </tr>
  <tr>
    <td>需求分析</td>
    <td></td>
    <td></td>
    <td></td>
  </tr>
  <tr>
    <td>设计阶段</td>
    <td></td>
    <td></td>
    <td></td>
  </tr>
  <tr>
    <td>开发阶段</td>
    <td></td>
    <td></td>
    <td></td>
  </tr>
  <tr>
    <td>测试阶段</td>
    <td></td>
    <td></td>
    <td></td>
  </tr>
</table>

<h2>👥 团队成员</h2>
<ul>
  <li></li>
  <li></li>
</ul>

<h2>⚠️ 风险评估</h2>
<ul>
  <li></li>
  <li></li>
</ul>

<h2>📈 成功标准</h2>
<ul>
  <li></li>
  <li></li>
</ul>', 'work', '🚀', true, true),

('每日日记', '用于记录每日生活和感想', '<h1>📔 每日日记</h1>
<p><strong>日期：</strong> </p>
<p><strong>天气：</strong> ☀️ </p>
<p><strong>心情：</strong> 😊 </p>

<h2>📝 今日要事</h2>
<h3>工作/学习</h3>
<ul>
  <li></li>
  <li></li>
</ul>

<h3>生活</h3>
<ul>
  <li></li>
  <li></li>
</ul>

<h2>💭 今日感想</h2>
<p></p>

<h2>🌟 今日收获</h2>
<ul>
  <li></li>
  <li></li>
</ul>

<h2>🎯 明日计划</h2>
<ul>
  <li></li>
  <li></li>
</ul>

<h2>📖 读书/学习</h2>
<p></p>

<h2>💝 感恩时刻</h2>
<p>今天我感恩...</p>', 'personal', '📔', true, true),

('读书笔记', '用于记录读书心得和摘录', '<h1>📖 读书笔记</h1>
<p><strong>书名：</strong> </p>
<p><strong>作者：</strong> </p>
<p><strong>阅读日期：</strong> </p>
<p><strong>评分：</strong> ⭐⭐⭐⭐⭐ </p>

<h2>📚 书籍信息</h2>
<p><strong>出版社：</strong> </p>
<p><strong>出版年份：</strong> </p>
<p><strong>页数：</strong> </p>
<p><strong>分类：</strong> </p>

<h2>📝 内容摘要</h2>
<p></p>

<h2>💎 精彩摘录</h2>
<blockquote>
  <p></p>
</blockquote>

<blockquote>
  <p></p>
</blockquote>

<h2>💭 读后感</h2>
<p></p>

<h2>🌟 启发和收获</h2>
<ul>
  <li></li>
  <li></li>
</ul>

<h2>🔗 相关思考</h2>
<p></p>

<h2>📋 行动清单</h2>
<p>基于这本书，我要开始...</p>
<ul>
  <li></li>
  <li></li>
</ul>', 'personal', '📖', true, true),

('代码笔记', '用于记录编程学习和技术要点', '<h1>💻 代码笔记</h1>
<p><strong>技术/语言：</strong> </p>
<p><strong>难度等级：</strong> ⭐⭐⭐ </p>
<p><strong>学习日期：</strong> </p>

<h2>🎯 学习目标</h2>
<ul>
  <li></li>
  <li></li>
</ul>

<h2>📋 核心概念</h2>
<p></p>

<h2>💡 代码示例</h2>
<pre><code>
// 在这里添加代码示例

</code></pre>

<h2>⚠️ 重要提示</h2>
<ul>
  <li></li>
  <li></li>
</ul>

<h2>🐛 常见错误</h2>
<ul>
  <li></li>
  <li></li>
</ul>

<h2>🔧 最佳实践</h2>
<ul>
  <li></li>
  <li></li>
</ul>

<h2>🔗 相关资源</h2>
<ul>
  <li><a href="">官方文档</a></li>
  <li><a href="">教程链接</a></li>
</ul>

<h2>✅ 实践作业</h2>
<ul>
  <li></li>
  <li></li>
</ul>', 'tech', '💻', true, true);

-- 6. 创建索引以提高查询性能
CREATE INDEX idx_note_templates_category ON note_templates(category);
CREATE INDEX idx_note_templates_user_id ON note_templates(user_id);
CREATE INDEX idx_note_templates_public ON note_templates(is_public, is_system); 